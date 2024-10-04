// components/Header.tsx

import React from "react";
import ProfileAvatar from "@/components/ProfileAvatar";

const Header: React.FC = () => {
  return (
    <header className="sticky shadow-sm top-0 z-10 bg-background px-4 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ask Billy</h1>
        <ProfileAvatar />
      </div>
    </header>
  );
};

export default Header;