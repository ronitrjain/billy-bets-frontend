"use client";
import { io } from "socket.io-client";
import React, { EventHandler, useState, useRef, useEffect } from 'react';
import Markdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import {
  Bird,
  Book,
  Bot,
  Code2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message { 
  role: string;
  content: string;
}
function addNewlinesToMarkdown(markdown: string): string {
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




export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [history, setHistory] = useState<string[]>([]);


  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlLoading, setSqlLoading] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);



  let session = uuidv4();




 









  const updateLastMessage = (message: string) => {
    setMessages((prevChats) => {
      const updatedChats = [...prevChats];
      if (updatedChats.length > 0) {
        updatedChats[updatedChats.length - 1].content = message;
      }
      return updatedChats;
    });
  };

  const getBillyResponse = async (input: string) => {
    setHistory((prev) => [...prev, input]);

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

    setSqlLoading(true);
    setIsAnswering(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: "Thinking..." },
    ]);

    socket.on("connect", () => {
      socket.emit("billy", {
        message: { session: session, message: [...history, input].toString() },
      });

      socket.on("billy", (data) => {
        console.log(data);

        if (data.type === "query") {
          setSqlQuery(data.response);
          setSqlLoading(false);
        }

        if (data.status !== "done" && data.type === "answer") {
          setSqlLoading(false);
          updateLastMessage(data.response);
          console.log(data.response);
        } else if (data.status === "done" && data.type === "answer") {
          setIsAnswering(false);
          updateLastMessage(data.response);
          setHistory((prev) => [...prev, data.response]);
          setSqlLoading(false);
          socket.disconnect();
        }
      });
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
    

      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }
  , [messages]);

   


  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      setInput("");
      console.log("sending");
      console.log(input);
      setIsAnswering(true);
      getBillyResponse(input);
    }
  };
  

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full ">
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Ask Billy</h1>
            <Drawer>
              <DrawerTrigger asChild></DrawerTrigger>
              <DrawerContent className="max-h-[80vh]">
                <DrawerHeader>
                  <DrawerTitle>Configuration</DrawerTitle>
                  <DrawerDescription>
                    Configure the settings for the model and messages.
                  </DrawerDescription>
                </DrawerHeader>
                <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                  <fieldset className="grid gap-6 rounded-lg border p-4">
                    <div className="grid gap-3">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue="system">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="content">SQL Query</Label>

                      <Textarea id="content" placeholder="You are a..." />
                    </div>
                  </fieldset>
                </form>
              </DrawerContent>
            </Drawer>
          </header>
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="relative hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              <form className="grid w-full items-start gap-6">
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <div className="grid gap-3">
                    <Label htmlFor="content">SQL Query</Label>
                    {sqlLoading ? (
                      <div
                        style={{ minHeight: "30rem" }}
                        className="w-ful flex justify-center items-center"
                      >
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        id="content"
                        readOnly
                        value={sqlQuery}
                        className="min-h-[30.5rem]"
                      />
                    )}
                  </div>
                </fieldset>
              </form>
            </div>
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2 overflow-y-scroll max-h-[90vh]">
              <div className="flex-1 overflow-y-scroll p-4">
                {messages.map((msg, index) => {
                  const isLastMessage = index === messages.length - 1;
                  return (
                    <div
                      key={index}
                      ref={isLastMessage ? messagesEndRef : null}
                      className="my-2 p-3 rounded-lg shadow-sm bg-white text-black text-sm self-start text-left break-words"
                      style={{ overflowWrap: "break-word", maxWidth: "95%" }}
                    >
                      {msg.role === "user" ? (
                        <Badge className="bg-primary text-xs text-white my-2">
                          User
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-900 text-xs my-2 text-white">
                          Billy
                        </Badge>
                      )}
                      <Markdown>{addNewlinesToMarkdown(msg.content)}</Markdown>
                    </div>
                  );
                })}
              </div>

              <form
                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                onSubmit={handleSend}
              >
                <Label htmlFor="message" className="sr-only">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex items-center p-3 pt-0">
                  <Button
                    type="submit"
                    className="ml-auto gap-1.5"
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
      </div>
    </TooltipProvider>
  );
}
