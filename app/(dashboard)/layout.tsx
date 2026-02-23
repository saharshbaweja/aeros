"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  LayoutDashboard,
  Radio,
  PlaneTakeoff,
  Settings,
  Command,
  MessageCircle,
  X,
  Users,
  Map,
  Sparkles,
} from "lucide-react";
import CommandBar from "@/components/command-bar";
import ChatThread from "@/components/chat-thread";
import { ChatMessage } from "@/types";
import { mockFlights, mockAlerts, mockWeather, mockAircraft } from "@/lib/mock-data";
import { AdsbAircraft } from "@/app/api/adsb/route";
import Link from "next/link";

const FlightMap = dynamic(() => import("@/components/flight-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-small text-zinc-500">Loading map...</p>
      </div>
    </div>
  ),
});

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home", shortcut: "1" },
  { href: "/dispatch", icon: Radio, label: "Dispatch", shortcut: "2" },
  { href: "/map", icon: Map, label: "Map", shortcut: "3" },
  { href: "/aircraft", icon: PlaneTakeoff, label: "Fleet", shortcut: "4" },
  { href: "/customers", icon: Users, label: "Customers", shortcut: "5" },
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
  const [adsbData, setAdsbData] = useState<AdsbAircraft[]>([]);

  const isMapPage = pathname === "/map";

  const scheduledFlights = mockFlights.filter((f) => f.status === "scheduled");
  const alerts = mockAlerts.filter((a) => a.status === "active");

  const fetchAdsb = useCallback(async () => {
    try {
      const res = await fetch("/api/adsb");
      const data = await res.json();
      setAdsbData(data.aircraft || []);
    } catch {
      // Keep existing data
    }
  }, []);

  useEffect(() => {
    fetchAdsb();
    const interval = setInterval(fetchAdsb, 10000);
    return () => clearInterval(interval);
  }, [fetchAdsb]);

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
    <div className="min-h-screen bg-surface flex relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-400/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-600/[0.02] rounded-full blur-[80px]" />
      </div>

      {/* Persistent background map */}
      {isMapPage && (
        <div className="fixed inset-0 z-0">
          <FlightMap
            adsbAircraft={adsbData}
            fleet={mockAircraft}
            filter="all"
            selectedIcao={null}
            onSelectAircraft={() => {}}
          />
        </div>
      )}

      {/* Sidebar Nav - Arc style */}
      <aside className="hidden md:flex w-[68px] flex-col items-center py-4 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.06] flex-shrink-0 z-30">
        {/* Logo */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-500/25 animate-glow">
          <Plane className="w-5 h-5 text-white" />
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
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                  isActive
                    ? "bg-white/[0.1] text-brand-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -left-[10px] w-[3px] h-5 bg-brand-400 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="absolute left-14 px-2.5 py-1.5 bg-surface-50 border border-white/[0.1] text-zinc-200 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                  <span className="ml-2 text-zinc-500 font-mono">{"\u2318"}{item.shortcut}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              chatOpen
                ? "bg-brand-500/20 text-brand-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
            }`}
          >
            <Sparkles className="w-[18px] h-[18px]" />
            <div className="absolute left-14 px-2.5 py-1.5 bg-surface-50 border border-white/[0.1] text-zinc-200 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              AI Copilot
            </div>
          </button>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all duration-200 group relative"
          >
            <Command className="w-[18px] h-[18px]" />
            <div className="absolute left-14 px-2.5 py-1.5 bg-surface-50 border border-white/[0.1] text-zinc-200 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Command Bar
              <span className="ml-2 text-zinc-500 font-mono">{"\u2318"}K</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex z-10">
        {/* Content panel */}
        <div
          className={`${
            isMapPage
              ? "w-0 md:w-0 overflow-hidden"
              : "w-full flex-1"
          } transition-all duration-300 relative`}
        >
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface/90 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-body font-semibold text-zinc-100">Aeros</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  chatOpen ? "bg-brand-500/20 text-brand-400" : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCommandBarOpen(true)}
                className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-400"
              >
                <Command className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 border-t border-white/[0.06] bg-surface/90 backdrop-blur-xl z-40">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                    isActive ? "text-brand-400" : "text-zinc-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="h-full overflow-hidden">
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
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:flex flex-col border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex-shrink-0"
              style={{ width: 420 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-100">Aeros Copilot</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatThread messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed inset-0 z-50 bg-surface flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-100">Aeros Copilot</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatThread messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} onSubmit={handleCommandSubmit} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-surface">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
