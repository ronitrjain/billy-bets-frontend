"use client";

import { io } from "socket.io-client";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import { CornerDownLeft } from "lucide-react";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import SuggestionBlocks from "@/components/SuggestionBlocks";
import Auth from "@/components/Auth";
import ProfileAvatar from "@/components/ProfileAvatar";
import ResponseButtons from "@/components/ResponseButtons";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MdOutlineReplay } from "react-icons/md";
import SpeechToTextButton from "../components/SpeechToText";

interface Message {
  role: string;
  content: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  sqlQuery: string;
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

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [isSqlDialogOpen, setIsSqlDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<{
    [key: number]: string | null;
  }>({});
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (chats.length === 0) {
      handleNewChat();
    }
  }, []);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const addMessageToCurrentChat = (message: Message) => {
    if (!currentChatId || !message.content.trim()) return;

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          console.log(chat.messages)
          const updatedMessages = [...chat.messages, message];
          const updatedChat = {
            ...chat,
            messages: updatedMessages,
          };
          return updatedChat;
        }
        return chat;
      })
    );
  };

  const handleAskAgain = (assistantMessageIndex: number) => {
    if (!currentChat) return;

    const userMessageIndex = assistantMessageIndex - 1;
    const userMessage = currentChat.messages[userMessageIndex];

    if (userMessage && userMessage.role === "user") {
      addMessageToCurrentChat(userMessage);
      setIsAnswering(true);
      getBillyResponse(userMessage.content);
    }
  };


  const updateLastMessageInCurrentChat = (content: string, done: boolean) => {
    if (!currentChatId) return;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages];
          if (updatedMessages.length > 0) {
            updatedMessages[updatedMessages.length - 1].content = content;
          }
          const updatedChat = {
            ...chat,
            messages: updatedMessages,
          };

          if (done) { 
            postChat(updatedMessages, chat.name, chat.sqlQuery, currentChatId);
          }

          console.log("Updating message")
         
          return updatedChat;
        }
        return chat;
      })
    );
  };

  const getChats = async () => {
    console.log("Get chats running");
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/retrieve-all-chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching chats:', errorData.error);
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();

      console.log(user.id, data);

      // Parse messages from JSON strings to arrays
      const parsedChats = data.chats.map((chat: any) => {
        let messagesArray = [];
        try {
          messagesArray = JSON.parse(chat.messages || '[]');
        } catch (e) {
          console.error('Error parsing messages:', e);
        }
        return {
          ...chat,
          messages: messagesArray,
        };
      });

      setChats(parsedChats || []);

      if (parsedChats && parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  // Move the useEffect hook outside of getChats
  useEffect(() => {
    getChats();
  }, [user]);

  const postChat = async (messages: Message[] | undefined, name: string | undefined, sqlQuery: string | undefined, chatId: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/post-chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          messages: JSON.stringify(messages) || [{}],
          name: name || 'Untitled Chat',
          sql_query: sqlQuery || '',
          chat_id: chatId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to post chat:', errorData.error);
        throw new Error('Failed to post chats');
      }

      const data = await response.json();
      console.log('Chat posted successfully:', data);
    } catch (error) {
      console.error('Failed to post chats:', error);
    }
  };

  const updateSqlQueryInCurrentChat = (sqlQuery: string) => {
    if (!currentChatId) return;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            sqlQuery,
          };
        }
        return chat;
      })
    );
  };

  const handleNewChat = () => {
    const newChatId = uuidv4();
    const newChat: ChatSession = {
      id: newChatId,
      name: `Chat ${chats.length + 1}`, 
      messages: [],
      sqlQuery: "",
    };
    setChats([...chats, newChat]);
    handleChangeChat(newChatId);
  };

  const uploadQuery = async (correct: boolean, index: number) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}store-query`;
    const userMessageIndex = index - 1;

    const data = {
      question: currentChat?.messages[userMessageIndex].content,
      answer: currentChat?.messages[index].content,
      correct: correct.toString(),
      category: "general",
      sql: currentChat?.sqlQuery,
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
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

    setIsAnswering(true);
    addMessageToCurrentChat({ role: "assistant", content: "Thinking..." });

    socket.on("connect", () => {
      socket.emit("billy", {
        message: {
          session: currentChatId,
          message: input,
        },
      });

      socket.on("billy", (data) => {
        if (data.type === "query") {
          updateSqlQueryInCurrentChat(data.response);
        }

        if (data.status !== "done" && data.type === "answer") {
          updateLastMessageInCurrentChat(data.response, false);
        } else if (data.status === "done" && data.type === "answer") {
          setIsAnswering(false);
          updateLastMessageInCurrentChat(data.response, true);
          
          socket.disconnect();
        }
      });
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessageToCurrentChat({ role: "user", content: suggestion });
    
    if (currentChat && currentChat.name.startsWith('Chat')) {
      updateChatName(currentChatId!, suggestion);
    }
    
    setIsAnswering(true);
    getBillyResponse(suggestion);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);

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
      addMessageToCurrentChat({ role: "user", content: input });
      if (currentChat && currentChat.name.startsWith('Chat')) {
        updateChatName(currentChatId!, input);
      }
      setInput("");
      setIsAnswering(true);
      getBillyResponse(input);
    }
  };

  const updateChatName = (chatId: string, firstMessage: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            name: firstMessage.slice(0, 10) + (firstMessage.length > 10 ? "..." : ""),
          };
        }
        return chat;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        addMessageToCurrentChat({ role: "user", content: input });
        if (currentChat && currentChat.name.startsWith('Chat')) {
          updateChatName(currentChatId!, input);
        }
        setInput("");
        setIsAnswering(true);
        getBillyResponse(input);
      }
    }
  };

  const handleChangeChat = (chat_id: string) => {
    setCurrentChatId(chat_id);
  };

  if (!session) {
    return <Auth />;
  }

  if (user && user.app_metadata.email_verified == false) {
    user.app_metadata.email_verified = true;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full">
        <header className="sticky shadow-sm top-0 z-10 flex h-[57px] items-center gap-2 bg-background px-4 justify-between">
          <h1 className="text-xl font-semibold">Ask Billy</h1>
          <div className="flex items-end gap-2 justify">
            <Dialog open={isSqlDialogOpen} onOpenChange={setIsSqlDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost">View SQL</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>SQL Query</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {currentChat && currentChat.sqlQuery ? (
                    <Textarea
                      readOnly
                      value={currentChat.sqlQuery}
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

        <main className="flex-1 flex flex-col  md:flex-row overflow-hidden">
          <div className="md:hidden p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-full">Open Chat List</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Button onClick={handleNewChat} className="mb-4 w-full">
                  New Chat
                </Button>
                <ul>
                  {chats.map((chat) => (
                    <li key={chat.id} className="mb-2">
                      <Button
                        variant={chat.id === currentChatId ? "outline" : "ghost"}
                        onClick={() => handleChangeChat(chat.id)}
                        className="w-full text-left truncate"
                      >
                        {chat.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-64 h-full hidden md:block bg-gray-100 p-4 overflow-auto">
            <Button onClick={handleNewChat} className="mb-4 w-full">
              New Chat
            </Button>
            <ul>
              {chats.map((chat) => (
                <li key={chat.id} className="mb-2">
                  <Button
                    variant={chat.id === currentChatId ? "outline" : "secondary"}
                    onClick={() => setCurrentChatId(chat.id)}
                    className="w-full text-left truncate"
                  >
                    {chat.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col w-full h-full rounded-2xl bg-muted/50 p-4 shadow-md overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
      {currentChat &&
        currentChat.messages &&
        currentChat.messages.map((msg, index) => {
          const isLastMessage = index === currentChat.messages.length - 1;
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

            {currentChat?.messages?.length === 0 && (
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