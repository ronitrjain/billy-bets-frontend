// components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/ProfileAvatar";

interface ChatSession {
  id: string;
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const user = useUser();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Fetch chats when the user is available
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retrieve-all-chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (!response.ok) {
          console.error("Failed to fetch chats");
          return;
        }

        const data = await response.json();
        const parsedChats = data.chats.map((chat: any) => ({
          id: chat.id,
          name: chat.name || "Untitled Chat",
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [user]);

  // Update currentChatId when the pathname changes
  useEffect(() => {
    const pathSegments = pathname?.split("/");
    const chatIdFromUrl = pathSegments && pathSegments[2];
    setCurrentChatId(chatIdFromUrl || null);
  }, [pathname]);

  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/chats/${newChatId}`);
  };

  const handleChangeChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  
  return (
    <aside className="w-64 h-screen bg-gray-100 flex flex-col p-4 overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Ask Billy</h1>
      <Button onClick={handleNewChat} className="mb-4 w-full">
        New Chat
      </Button>
      <nav className="flex-1">
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
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
      </nav>
      <div className="mt-4">
        <ProfileAvatar />
      </div>
    </aside>
  );
}