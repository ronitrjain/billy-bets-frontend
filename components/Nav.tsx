// components/Navbar.tsx

"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/ProfileAvatar";

interface ChatSession {
  id: string;
  name: string;
  updated_at: string; // Add this field to store the timestamp
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

        // Parse chats and include the 'updated_at' timestamp
        const parsedChats = data.chats.map((chat: any) => ({
          id: chat.id,
          name: chat.name || "Untitled Chat",
          updated_at: chat.updated_at || chat.created_at, // Use 'updated_at' or 'created_at' timestamp
        }));

        // Sort chats by 'updated_at' in descending order (most recent first)
        parsedChats.sort(
          (a: ChatSession, b: ChatSession) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        // Limit to 10 most recent chats
        const recentChats = parsedChats.slice(0, 10);

        setChats(recentChats);
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
    <aside className="w-64 h-100 bg-gray-100 flex flex-col p-4 overflow-hidden">
      <Button onClick={handleNewChat} className="mb-4 w-full">
        New Chat
      </Button>
      <nav className="flex-1">
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link href={`/chats/${chat.id}`}>
  <Button
    variant={chat.id === currentChatId ? "outline" : "ghost"}
    className="w-full text-left truncate"
  >
    {chat.name}
  </Button>
</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}