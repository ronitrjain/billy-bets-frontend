import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import SupabaseProvider from "@/components/SupabaseProvider";
import Navbar from "@/components/Nav";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Billy Bets",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen`}>
        <SupabaseProvider>
            {/* Main content area */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          <Analytics />
        </SupabaseProvider>
      </body>
    </html>
  );
}