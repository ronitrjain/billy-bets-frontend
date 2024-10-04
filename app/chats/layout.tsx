// app/chats/layout.tsx
"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import SupabaseProvider from "@/components/SupabaseProvider";
import Header from "@/components/Header";  // Import your Header component
import Navbar from "@/components/Nav";  // Import your Navbar component
import { useUser } from "@supabase/auth-helpers-react";
import Auth from "@/components/Auth"; // Import your Auth component

const inter = Inter({ subsets: ["latin"] });

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [isSqlDialogOpen, setIsSqlDialogOpen] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const user = useUser(); // Check if the user is logged in

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Auth /> {/* Show the Auth component if the user is not logged in */}
      </div>
    );
  }

  return (
    <div className={`${inter.className} flex h-full`}>
      {/* Chat layout for logged-in users */}
      <div className="flex flex-col w-full h-full">
        {/* Header component */}
        <Header
          sqlQuery={sqlQuery}
          setIsSqlDialogOpen={setIsSqlDialogOpen}
          isSqlDialogOpen={isSqlDialogOpen}
        />

        {/* Below the header, we have a flex container for the navbar and main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar/Navbar */}
          <Navbar />

          {/* Main content area */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}