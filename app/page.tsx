// app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@supabase/auth-helpers-react";
import Auth from "@/components/Auth"
export default function HomePage() {
  const router = useRouter(); 
  const user = useUser(); // Check if the user is logged in

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Auth /> {/* Show the Auth component if the user is not logged in */}
      </div>
    );
  }
  useEffect(() => {
    const newChatId = uuidv4();
    router.push(`/chats/${newChatId}`);
  }, [router]);

  return null;
}