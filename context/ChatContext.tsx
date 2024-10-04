"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

interface ChatSession {
  id: string;
  name: string;
  updated_at: string;
}

interface ChatContextProps {
  chats: ChatSession[];
  addChat: (newChat: ChatSession) => Promise<void>;
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const user = useUser();

  const postChat = useCallback(async (chat: ChatSession) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          chat_id: chat.id,
          name: chat.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post chat to the server');
      }

      const savedChat = await response.json();
      return savedChat;
    } catch (error) {
      console.error('Error posting new chat:', error);
      throw error;
    }
  }, [user]);

  const addChat = useCallback(async (newChat: ChatSession) => {
    try {
      const savedChat = await postChat(newChat);
      setChats((prevChats) => [savedChat, ...prevChats]);
    } catch (error) {
      console.error('Failed to add chat:', error);
      // Optionally, remove the chat from the local state if the server request failed
      setChats((prevChats) => prevChats.filter(chat => chat.id !== newChat.id));
    }
  }, [postChat]);

  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/retrieve-all-chats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();

      const parsedChats = data.chats.map((chat: any) => ({
        id: chat.id,
        name: chat.name || 'Untitled Chat',
        updated_at: chat.updated_at || chat.created_at,
      }));

      setChats(parsedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  const contextValue: ChatContextProps = {
    chats,
    addChat,
    setChats,
    refreshChats: fetchChats,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};