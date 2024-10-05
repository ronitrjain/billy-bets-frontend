"use client";

import { Inter } from "next/font/google";
import Header from "@/components/Header";  // Import your Header component
import Navbar from "@/components/Nav";  // Import your Navbar component
import { useUser } from "@supabase/auth-helpers-react";
import Auth from "@/components/Auth"; // Import your Auth component

const inter = Inter({ subsets: ["latin"] });

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = useUser(); // Check if the user is logged in

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Auth /> {/* Show the Auth component if the user is not logged in */}
      </div>
    );
  }

  
  return (
    <div className={`${inter.className} flex flex-col h-full`}>
      {/* Chat layout for logged-in users */}
      <Header />
      

      {/* Mobile Navbar will appear above the main chat screen */}
      <div className="md:hidden">
        <Navbar />
      </div>

      {/* Below the header, we have a flex container for the navbar (desktop) and main content */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar/Navbar for desktop */}
        <div className="hidden md:flex">
          <Navbar />
        </div>

        {/* Main content area */}
        <main className="flex-1 h-full overflow-auto">{children}</main>
      </div>
    </div>
  );
}