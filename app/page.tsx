// app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const newChatId = uuidv4();
    router.replace(`/chats/${newChatId}`);
  }, [router]);

  return null;
}