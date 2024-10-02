// app/chat/[chatid]/page.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Markdown from "react-markdown";
import { CornerDownLeft } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SuggestionBlocks from "@/components/SuggestionBlocks";
import Auth from "@/components/Auth";
import ProfileAvatar from "@/components/ProfileAvatar";
import ResponseButtons from "@/components/ResponseButtons";
import { MdOutlineReplay } from "react-icons/md";
import SpeechToTextButton from "@/components/SpeechToText";

interface Message {
  role: string;
  content: string;
}

function addNewlinesToMarkdown(markdown: string): string {
  if (typeof markdown !== "string") {
    return "";
  }

  const maxLineLength = 100;
  let result = "";
  let currentLineLength = 0;

  for (const char of markdown) {
    if (currentLineLength >= maxLineLength && char === " ") {
      result += "\n";
      currentLineLength = 0;
    } else {
      result += char;
      currentLineLength++;
    }
  }

  return result;
}

export default function ChatPage() {
  const { chatid: chatIdParam } = useParams();
  const chatId = Array.isArray(chatIdParam) ? chatIdParam[0] : chatIdParam;

  if (!chatId) {
    console.error("chatId is undefined");
    return <div>Error: chatId is undefined</div>;
  }

  const session = useSession();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [isSqlDialogOpen, setIsSqlDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<{
    [key: number]: string | null;
  }>({});
  const [sqlQuery, setSqlQuery] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    const fetchChat = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/retrieve-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.id, chat_id: chatId }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to fetch chat:",
            response.status,
            response.statusText,
            errorText
          );
          return;
        }

        const data = await response.json();
        console.log("Data received from server:", data);

        if (!data.chat) {
          console.error("Chat data is missing or invalid");
          return;
        }

        let messagesArray: Message[] = [];
        try {
          messagesArray = JSON.parse(data.chat || "[]");
        } catch (parseError) {
          console.error("Error parsing messages:", parseError);
        }

        setMessages(messagesArray);
        setSqlQuery(data.chat.sql_query || "");
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();
  }, [user, chatId]);

  const addMessage = (message: Message) => {
    if (!message.content.trim()) return;
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const updateLastMessage = (content: string, done: boolean) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1].content = content;
      }

      if (done) {
        postChat(updatedMessages, sqlQuery);
      }

      return updatedMessages;
    });
  };

  const postChat = async (messages: Message[], sqlQuery: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post-chats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            messages: JSON.stringify(messages),
            name:
              messages[0]?.content.slice(0, 10) +
                (messages[0]?.content.length > 10 ? "..." : "") ||
              "Untitled Chat",
            sql_query: sqlQuery || "",
            chat_id: chatId,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to post chat:", errorData.error);
        throw new Error("Failed to post chat");
      }

      const data = await response.json();
      console.log("Chat posted successfully:", data);
    } catch (error) {
      console.error("Failed to post chat:", error);
    }
  };

  const uploadQuery = async (correct: boolean, index: number) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/store-query`;
    const userMessageIndex = index - 1;

    const data = {
      question: messages[userMessageIndex].content,
      answer: messages[index].content,
      correct: correct.toString(),
      category: "general",
      sql: sqlQuery,
      user_id: user?.id,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Query stored/updated successfully:", responseData);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Error storing/updating query:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Network error:", error);
      return false;
    }
  };

  const getBillyResponse = async (input: string) => {
    if (!chatId) {
      console.error("chatId is undefined");
      return;
    }

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

    setIsAnswering(true);
    addMessage({ role: "assistant", content: "Thinking..." });

    socket.on("connect", () => {
      socket.emit("billy", {
        message: {
          session: chatId,
          message: input,
        },
      });

      socket.on("billy", (data) => {
        if (data.type === "query") {
          setSqlQuery(data.response);
        }

        if (data.status !== "done" && data.type === "answer") {
          updateLastMessage(data.response, false);
        } else if (data.status === "done" && data.type === "answer") {
          setIsAnswering(false);
          updateLastMessage(data.response, true);
          socket.disconnect();
        }
      });
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessage({ role: "user", content: suggestion });
    setIsAnswering(true);
    getBillyResponse(suggestion);
  };

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("user_id", session.user?.id)
          .single();

        if (data) {
          setUserName(data.first_name);
        } else {
          console.error(error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage({ role: "user", content: input });
      setInput("");
      setIsAnswering(true);
      getBillyResponse(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        addMessage({ role: "user", content: input });
        setInput("");
        setIsAnswering(true);
        getBillyResponse(input);
      }
    }
  };

  const handleAskAgain = (assistantMessageIndex: number) => {
    const userMessageIndex = assistantMessageIndex - 1;
    const userMessage = messages[userMessageIndex];

    if (userMessage && userMessage.role === "user") {
      addMessage(userMessage);
      setIsAnswering(true);
      getBillyResponse(userMessage.content);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full">
        <header className="sticky shadow-sm top-0 z-10 flex h-[57px] items-center gap-2 bg-background px-4 justify-between">
          <h1 className="text-xl font-semibold">Ask Billy</h1>
          <div className="flex items-end gap-2 justify">
            <Dialog
              open={isSqlDialogOpen}
              onOpenChange={setIsSqlDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="ghost">View SQL</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>SQL Query</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {sqlQuery ? (
                    <Textarea
                      readOnly
                      value={sqlQuery}
                      className="w-full h-64"
                    />
                  ) : (
                    <p>No SQL query available.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ProfileAvatar />
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col w-full h-full rounded-2xl bg-muted/50 p-4 shadow-md overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                const isCompletedResponse =
                  msg.role === "assistant" && !isAnswering;
                return (
                  <div
                    key={index}
                    ref={isLastMessage ? messagesEndRef : null}
                    className="my-2 p-3 rounded-2xl shadow-md bg-white text-black text-sm self-start text-left break-words border-0"
                    style={{ overflowWrap: "break-word", maxWidth: "95%" }}
                  >
                    {msg.role === "user" ? (
                      <Badge className="bg-primary text-xs text-white my-2 rounded-full">
                        User
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-900 text-xs my-2 text-white rounded-full">
                        Billy
                      </Badge>
                    )}
                    <Markdown>{addNewlinesToMarkdown(msg.content)}</Markdown>
                    {user && isCompletedResponse && (
                      <div className="mt-4 flex justify-end items-center gap-2">
                        <ResponseButtons
                          uploadQuery={uploadQuery}
                          index={index}
                          feedbackStatus={feedbackStatus}
                          setFeedbackStatus={setFeedbackStatus}
                        />
                        <Button
                          variant="ghost"
                          className="ml-2"
                          onClick={() => handleAskAgain(index)}
                          disabled={isAnswering}
                        >
                          <MdOutlineReplay size={20} />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {messages.length === 0 && (
              <SuggestionBlocks onSuggestionClick={handleSuggestionClick} />
            )}

            <form
              className="relative overflow-hidden rounded-2xl bg-background focus-within:ring-1 focus-within:ring-ring shadow-md mt-2"
              onSubmit={handleSend}
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 rounded-2xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center p-3 pt-0 justify-end gap-2">
                <SpeechToTextButton
                  onResult={(transcript) => {
                    setInput(transcript);
                  }}
                />
                <Button
                  type="submit"
                  className="gap-1.5 rounded-full shadow-md"
                  disabled={isAnswering}
                >
                  Ask Billy
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}