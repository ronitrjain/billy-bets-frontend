"use client";
import { io } from "socket.io-client";
import React, { EventHandler, useState } from 'react';
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

// Messages Component
const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const updateLastMessage = (message: string) => {
    setMessages((prevChats) => {
      const updatedChats = [...prevChats];
      if (updatedChats.length > 0) {
        updatedChats[updatedChats.length - 1].content = message;
      }
      return updatedChats;
    });
  };


  const getBillyResponse = async (input: String) => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`);

    socket.on("connect", () => {
      socket.emit("billy", {
        question: input,
      });

      socket.on("billy", (data: any) => {
        if (data.status !== 'done' && data.type === 'answer') {
          updateLastMessage(data.response);
        } else if (data.status === 'done' && data.type === 'answer') {
          updateLastMessage(data.response);
          socket.disconnect();
        }
      });
    });

    setIsAnswering(false);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }]);
      setInput('');
      setIsAnswering(true);
      getBillyResponse(input);
    }
  };
  


  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
     
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}>
            {msg.content}
          </div>
        ))}
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
          
          
          <Button type="submit" className="ml-auto gap-1.5">
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Dashboard() {
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
          <div className="border-b p-2">
            <Button  aria-label="Home">
              <Triangle className="size-5 fill-foreground" />
            </Button>
          </div>
       
          <nav className="mt-auto grid gap-1 p-2">
         
       
          </nav>
        </aside>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Ask Bily</h1>
            <Drawer>
              <DrawerTrigger asChild>
                <Button   className="md:hidden">
                  <Settings className="size-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DrawerTrigger>
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
                    <Textarea
                      id="content"
                      readOnly
                      placeholder=""
                      className="min-h-[30.5rem]"
                    />
                  </div>
                </fieldset>
              </form>
            </div>
            <Messages />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
