"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  LayoutDashboard,
  Calendar,
  PlaneTakeoff,
  Settings,
  Command,
  HelpCircle,
  MessageCircle,
  X,
  DollarSign,
  Map,
} from "lucide-react";
import CommandBar from "@/components/command-bar";
import ChatThread from "@/components/chat-thread";
import { ChatMessage } from "@/types";
import { mockFlights, mockAlerts, mockWeather } from "@/lib/mock-data";
import Link from "next/link";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home", shortcut: "1" },
  { href: "/flights", icon: Calendar, label: "Flights", shortcut: "2" },
  { href: "/map", icon: Map, label: "Map", shortcut: "3" },
  { href: "/aircraft", icon: PlaneTakeoff, label: "Aircraft", shortcut: "4" },
  { href: "/pricing", icon: DollarSign, label: "Pricing", shortcut: "5" },
  { href: "/settings", icon: Settings, label: "Settings", shortcut: "," },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scheduledFlights = mockFlights.filter((f) => f.status === "scheduled");
  const alerts = mockAlerts.filter((a) => a.status === "active");

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.message ||
            "I'm having trouble connecting. Please check that the OpenAI API key is configured.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm currently running in demo mode. To enable AI responses, add your OpenAI API key to .env.local.\n\nHere's what I can tell you:\n- You have " +
            scheduledFlights.length +
            " flights scheduled today\n- " +
            alerts.length +
            " active alerts need attention\n- Weather is " +
            mockWeather.flight_category,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, scheduledFlights.length, alerts.length]
  );

  // Handle query from command bar
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setChatOpen(true);
      handleSendMessage(q);
      window.history.replaceState(null, "", pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen(true);
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const item = navItems.find((n) => n.shortcut === e.key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }

      if (e.key === "Escape") {
        setCommandBarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleCommandSubmit = (message: string) => {
    setChatOpen(true);
    handleSendMessage(message);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Nav */}
      <aside className="hidden md:flex w-16 flex-col items-center py-4 border-r border-surface-400 bg-surface-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-6">
          <Plane className="w-5 h-5 text-brand-400" />
        </div>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isActive
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-gray-500 hover:text-gray-300 hover:bg-surface-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -left-[9px] w-[3px] h-5 bg-brand-400 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="absolute left-14 px-2 py-1 bg-surface-300 border border-surface-400 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                  <span className="ml-2 text-gray-500 font-mono">
                    {"\u2318"}
                    {item.shortcut}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
              chatOpen
                ? "bg-brand-500/20 text-brand-400"
                : "text-gray-500 hover:text-gray-300 hover:bg-surface-300"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <div className="absolute left-14 px-2 py-1 bg-surface-300 border border-surface-400 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              AI Copilot
            </div>
          </button>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-300 transition-all group relative"
          >
            <Command className="w-5 h-5" />
            <div className="absolute left-14 px-2 py-1 bg-surface-300 border border-surface-400 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Command Bar
              <span className="ml-2 text-gray-500 font-mono">{"\u2318"}K</span>
            </div>
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-300 transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-surface-400">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-brand-400" />
              <span className="text-body font-semibold text-white">Aeros</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  chatOpen
                    ? "bg-brand-500/20 text-brand-400"
                    : "bg-surface-300 text-gray-400"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCommandBarOpen(true)}
                className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center text-gray-400"
              >
                <Command className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 border-t border-surface-400 bg-surface-100/80 backdrop-blur-xl z-40">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                    isActive ? "text-brand-400" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col border-l border-surface-400 bg-surface-100 overflow-hidden flex-shrink-0"
              style={{ width: 380 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      Aeros Copilot
                    </span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Online
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-300 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatThread
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile chat overlay */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed inset-0 z-50 bg-surface-100 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Aeros Copilot
                  </span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-300 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatThread
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onSubmit={handleCommandSubmit}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
