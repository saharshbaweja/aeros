import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aeros - AI Copilot for Aviation Operations",
  description:
    "Next-generation AI copilot for FBOs and flight schools. Conversational interface with ambient intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface font-sans">{children}</body>
    </html>
  );
}
