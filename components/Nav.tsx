import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  name: string;
  updated_at: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/retrieve-all-chats`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.id }),
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch chats");
          return;
        }

        const data = await response.json();

        const parsedChats = data.chats.map((chat: any) => ({
          id: chat.id,
          name: chat.name || "Untitled Chat",
          updated_at: chat.updated_at || chat.created_at,
        }));

        setChats(parsedChats.slice(0, 10));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [user]);

  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/chats/${newChatId}`);
  };

  const handleChangeChat = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/chats/${chatId}`);
  };

  return (
    <>
      {/* Desktop view - sidebar */}
      <aside className="hidden md:flex w-64 h-full bg-gray-100 flex-col p-4">
        <Button onClick={handleNewChat} className="mb-4 w-full">
          New Chat
        </Button>
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
      </aside>

      {/* Mobile view - Popover for chat list */}
      <div className="md:hidden flex justify-center mt-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-black text-white">Open Chat List</Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-4 mt-2 relative left-1/2 -translate-x-1/2"
            side="bottom"
            align="center"
            sideOffset={10} // Add spacing between button and popover
          >
            <Button onClick={handleNewChat} className="mb-4 w-full">
              New Chat
            </Button>
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
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default Navbar;