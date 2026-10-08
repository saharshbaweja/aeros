"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gauge,
  Map,
  Plane,
  PlaneTakeoff,
  Radio,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import ChatThread from "@/components/chat-thread";
import type { ChatMessage } from "@/types";

const navItems = [
  { href: "/dashboard", icon: Gauge, label: "Command", shortcut: "1" },
  { href: "/dispatch", icon: Radio, label: "Dispatch", shortcut: "2" },
  { href: "/map", icon: Map, label: "Map", shortcut: "3" },
  { href: "/aircraft", icon: PlaneTakeoff, label: "Fleet", shortcut: "4" },
  { href: "/customers", icon: Users, label: "People", shortcut: "5" },
  { href: "/settings", icon: Settings, label: "Settings", shortcut: "," },
];

const demoMission = {
  flightId: "AEROS-DEMO-142",
  departure: "KPDK",
  destination: "KCHA",
  alternates: ["KRMG"],
  aircraft: { tailNumber: "N731GT", type: "C172" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendToAeros = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            mission: demoMission,
          }),
        });

        const data = await response.json();
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              data.message ||
              "Aeros could not build a supported answer from the current mission context.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "The operational intelligence service is unavailable. Live facts have not been guessed or substituted with demo data.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const question = params.get("q");
    if (!question) return;

    setChatOpen(true);
    void sendToAeros(question);
    window.history.replaceState(null, "", pathname);
    // Run once for link-generated Ask Aeros prompts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
        const destination = navItems.find((item) => item.shortcut === event.key);
        if (destination) {
          event.preventDefault();
          router.push(destination.href);
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setChatOpen(true);
      }

      if (event.key === "Escape") setChatOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="h-screen bg-surface text-zinc-100 flex overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-72 -left-64 w-[720px] h-[720px] rounded-full bg-brand-500/[0.035] blur-[130px]" />
        <div className="absolute -bottom-72 right-0 w-[640px] h-[640px] rounded-full bg-cyan-400/[0.02] blur-[130px]" />
      </div>

      <aside className="hidden md:flex w-[72px] flex-col items-center py-4 border-r border-white/[0.06] bg-[#0a0a0c]/85 backdrop-blur-xl z-30 flex-shrink-0">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center mb-6 shadow-lg"
          aria-label="Aeros command center"
        >
          <Plane className="w-5 h-5" />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  active
                    ? "bg-white/[0.09] text-brand-300"
                    : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {active && (
                  <motion.span
                    layoutId="aeros-nav"
                    className="absolute -left-[11px] w-[3px] h-5 rounded-r-full bg-brand-400"
                  />
                )}
                <span className="absolute left-14 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#111114] text-[10px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
                  {item.label}
                  <span className="ml-2 font-mono text-zinc-600">⌘{item.shortcut}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              chatOpen
                ? "bg-brand-500/15 text-brand-300"
                : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05]"
            }`}
            aria-label="Ask Aeros"
          >
            <Sparkles className="w-[18px] h-[18px]" />
            <span className="absolute left-14 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#111114] text-[10px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl">
              Ask Aeros · ⌘K
            </span>
          </button>
          <Link href="/" className="text-[8px] uppercase tracking-[0.14em] text-zinc-700 hover:text-zinc-500 transition-colors">
            Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <header className="md:hidden h-14 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0c]/90 backdrop-blur-xl z-30">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">Aeros</div>
              <div className="text-[8px] uppercase tracking-[0.15em] text-zinc-600">operations</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center text-brand-300"
            aria-label="Ask Aeros"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

        <nav className="md:hidden h-16 px-2 border-t border-white/[0.06] bg-[#0a0a0c]/95 backdrop-blur-xl flex items-center justify-around z-30">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-[54px] h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[9px] transition-colors ${
                  active ? "text-brand-300 bg-brand-500/[0.08]" : "text-zinc-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Ask Aeros"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="md:hidden fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: 440, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 440, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed md:relative right-0 top-0 bottom-0 w-[min(420px,calc(100vw-20px))] md:w-[420px] flex flex-col border-l border-white/[0.07] bg-[#0c0c0f]/98 md:bg-[#0c0c0f]/90 backdrop-blur-2xl z-50 md:z-30 shadow-[-32px_0_80px_rgba(0,0,0,.25)]"
            >
              <div className="h-16 px-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-brand-400/15 bg-brand-500/[0.08] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Ask Aeros</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] text-zinc-600">grounded in mission context</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
                  aria-label="Close Ask Aeros"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatThread messages={messages} onSendMessage={sendToAeros} isLoading={isLoading} />
              </div>
              <div className="px-5 py-2.5 border-t border-white/[0.05] text-[9px] leading-4 text-zinc-700">
                Decision support only. Authority remains with the operator, PIC, dispatcher, and maintenance personnel where applicable.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
