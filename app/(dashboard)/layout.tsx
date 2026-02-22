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
  ChevronLeft,
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
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-small text-slate-400">Loading map...</p>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isMapPage = pathname === "/map";

  const scheduledFlights = mockFlights.filter((f) => f.status === "scheduled");
  const alerts = mockAlerts.filter((a) => a.status === "active");

  // Fetch ADS-B data for background map
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
    <div className="min-h-screen bg-surface-100 flex relative">
      {/* Persistent background map */}
      <div className="fixed inset-0 z-0">
        <FlightMap
          adsbAircraft={adsbData}
          fleet={mockAircraft}
          filter="all"
          selectedIcao={null}
          onSelectAircraft={() => {}}
        />
        {!isMapPage && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Sidebar Nav */}
      <aside className="hidden md:flex w-16 flex-col items-center py-4 bg-white/95 backdrop-blur-md border-r border-slate-200 flex-shrink-0 z-30 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mb-6 shadow-lg shadow-brand-500/25">
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
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-slate-400 hover:text-brand-500 hover:bg-brand-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -left-[9px] w-[3px] h-5 bg-brand-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="absolute left-14 px-2 py-1 bg-brand-800 text-white rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                  <span className="ml-2 text-brand-300 font-mono">{"\u2318"}{item.shortcut}</span>
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
                ? "bg-brand-500/10 text-brand-500"
                : "text-slate-400 hover:text-brand-500 hover:bg-brand-50"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <div className="absolute left-14 px-2 py-1 bg-brand-800 text-white rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              AI Copilot
            </div>
          </button>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-500 hover:bg-brand-50 transition-all group relative"
          >
            <Command className="w-5 h-5" />
            <div className="absolute left-14 px-2 py-1 bg-brand-800 text-white rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              Command Bar
              <span className="ml-2 text-brand-300 font-mono">{"\u2318"}K</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex z-10">
        {/* Content panel overlaying the map */}
        <div
          className={`${
            isMapPage
              ? "w-0 md:w-0 overflow-hidden"
              : sidebarCollapsed
              ? "w-0 md:w-0 overflow-hidden"
              : "w-full md:w-[520px] lg:w-[600px]"
          } transition-all duration-300 flex-shrink-0 relative`}
        >
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-brand-500" />
              <span className="text-body font-semibold text-slate-800">Aeros</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  chatOpen ? "bg-brand-500/10 text-brand-500" : "bg-slate-100 text-slate-400"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCommandBarOpen(true)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <Command className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 border-t border-slate-200 bg-white/95 backdrop-blur-xl z-40">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                    isActive ? "text-brand-500" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="h-full bg-white/95 backdrop-blur-md shadow-xl border-r border-slate-200/50 overflow-hidden">
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

        {/* Collapse toggle */}
        {!isMapPage && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex fixed z-20 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-r-lg items-center justify-center text-slate-400 hover:text-brand-500 shadow-md transition-all"
            style={{ left: sidebarCollapsed ? 64 : 64 + 600 }}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Chat Sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col border-l border-slate-200 bg-white/95 backdrop-blur-md overflow-hidden flex-shrink-0 ml-auto shadow-xl"
              style={{ width: 380 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Aeros Copilot</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">Online</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed inset-0 z-50 bg-white flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Aeros Copilot</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
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
        <div className="flex items-center justify-center h-screen bg-surface-100">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
