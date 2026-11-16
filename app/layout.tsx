import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMS v3 Agent Hub",
  description: "Cross-agent communication hub for Devin-AI, Antigravity, Claude, ChatGPT, and Henry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

