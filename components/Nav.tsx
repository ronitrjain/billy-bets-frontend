import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  name: string;
  created_at: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const user = useUser(); // Fetch the authenticated user from Supabase
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect triggered");

    if (!user) {
      console.log("No user found");
      return;
    }

    console.log("User found:", user.id);

    const fetchChats = async () => {
      console.log("Starting fetchChats for user:", user.id);
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

        console.log("Response received from API");

        if (!response.ok) {
          console.error("Failed to fetch chats, response not ok");
          return;
        }

        const data = await response.json();
        console.log("Fetched chats data:", data);

        // Sort chats by `created_at` in descending order
        let sortedChats = data.chats?.length
          ? data.chats.sort(
              (a: ChatSession, b: ChatSession) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          : [];

        console.log("Sorted chats:", sortedChats);

        // Only create an "Untitled Chat" if there are no chats at all
        if (sortedChats.length === 0) {
          const newChatId = await createUntitledChat();
          sortedChats = [
            {
              id: newChatId,
              name: "Untitled Chat",
              created_at: new Date().toISOString(),
            },
          ];
          console.log("Created 'Untitled Chat' since no chats exist.");
        }

        // Update state with chats
        setChats(sortedChats.slice(0, 10)); // Limit to 10 chats, if more
      } catch (error) {
        console.error("Error in fetchChats:", error);
      }
    };

    const createUntitledChat = async () => {
      const newChatId = uuidv4(); // Generate a unique ID for the new chat

      try {
        console.log("Creating a new untitled chat for user:", user.id);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post-chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            messages: JSON.stringify([]), // No messages yet
            name: "Untitled Chat",
            sql_query: "", // No SQL query yet
            chat_id: newChatId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create chat:", errorData.error);
          throw new Error("Failed to create chat");
        }

        console.log("New Untitled Chat created successfully with ID:", newChatId);
        return newChatId;
      } catch (error) {
        console.error("Error creating new chat:", error);
        throw error; // Rethrow the error to ensure proper error handling
      }
    };

    fetchChats();
  }, [user]);

  const handleNewChat = async () => {
    const newChatId = uuidv4();

    // Update UI immediately with new chat
    const newChat = {
      id: newChatId,
      name: "Untitled Chat",
      created_at: new Date().toISOString(),
    };
    setChats((prevChats) => [newChat, ...prevChats].slice(0, 10)); // Limit to the last 10 chats

    // Post the new chat to the server
    await postChat(newChatId);

    // Navigate to the new chat
    router.push(`/chats/${newChatId}`);
  };

  const postChat = async (newChatId: string) => {
    try {
      console.log("Posting new chat with ID:", newChatId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post-chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          messages: JSON.stringify([]), // No messages yet
          name: "Untitled Chat",
          sql_query: "", // No SQL query yet
          chat_id: newChatId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to post chat:", errorData.error);
        throw new Error("Failed to post chat");
      }
      console.log("Chat posted successfully with ID:", newChatId);
    } catch (error) {
      console.error("Failed to post chat:", error);
    }
  };

  const handleChangeChat = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/chats/${chatId}`);
  };

  console.log("Current chats state:", chats);

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