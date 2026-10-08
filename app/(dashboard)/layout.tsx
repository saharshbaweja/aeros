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
            messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
            mission: demoMission,
          }),
        });

        const data = await response.json();
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message || "Aeros could not build a supported answer from the current mission context.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "The operational intelligence service is unavailable. Live facts have not been guessed or substituted with demo data.",
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
    <div className="flex h-screen overflow-hidden bg-[#0b0c0e] text-zinc-100">
      <aside className="hidden w-[220px] flex-none flex-col border-r border-white/[0.07] bg-[#0d0e10] md:flex">
        <div className="flex h-[68px] items-center border-b border-white/[0.06] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Aeros command center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-[-0.02em] text-zinc-100">Aeros</div>
              <div className="mt-0.5 text-[9px] text-zinc-600">SkyHaven · KPDK</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-4">
          <div className="px-2 pb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700">Workspace</div>
          <nav className="space-y-0.5">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[11px] transition-colors ${active ? "bg-white/[0.07] text-zinc-100" : "text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-300"}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-zinc-300" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                  <span>{item.label}</span>
                  <span className="ml-auto font-mono text-[8px] text-zinc-700">⌘{item.shortcut}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 px-2 pb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-700">System</div>
          <Link
            href="/settings"
            className={`group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[11px] transition-colors ${pathname.startsWith("/settings") ? "bg-white/[0.07] text-zinc-100" : "text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-300"}`}
          >
            <Settings className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
            Settings
            <span className="ml-auto font-mono text-[8px] text-zinc-700">⌘,</span>
          </Link>
        </div>

        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${chatOpen ? "border-white/[0.1] bg-white/[0.07]" : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05]"}`}
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-zinc-200">Ask Aeros</div>
              <div className="mt-0.5 text-[8px] text-zinc-700">Mission-aware · ⌘K</div>
            </div>
          </button>
          <Link href="/" className="mt-2 block px-2 py-1 text-[9px] text-zinc-700 transition-colors hover:text-zinc-500">
            aeros.ai ↗
          </Link>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d0e10] px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">Aeros</div>
              <div className="text-[8px] text-zinc-700">Operations</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[10px] text-zinc-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>

        <nav className="flex h-16 items-center justify-around border-t border-white/[0.06] bg-[#0d0e10] px-2 md:hidden">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-11 min-w-[54px] flex-col items-center justify-center gap-1 rounded-lg text-[9px] ${active ? "bg-white/[0.06] text-zinc-200" : "text-zinc-600"}`}
              >
                <Icon className="h-4 w-4" />
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
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: 440, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 440, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[min(420px,calc(100vw-20px))] flex-col border-l border-white/[0.08] bg-[#0d0e10] shadow-[-24px_0_70px_rgba(0,0,0,.35)] md:relative md:z-20 md:w-[420px]"
            >
              <div className="flex h-[68px] flex-none items-center justify-between border-b border-white/[0.06] px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035]">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-100">Ask Aeros</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-zinc-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Grounded in Mission 142
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                  aria-label="Close Ask Aeros"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <ChatThread messages={messages} onSendMessage={sendToAeros} isLoading={isLoading} />
              </div>
              <div className="border-t border-white/[0.05] px-5 py-2.5 text-[8px] leading-4 text-zinc-700">
                Decision support only. Authority remains with the operator, PIC, dispatcher and maintenance personnel where applicable.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
