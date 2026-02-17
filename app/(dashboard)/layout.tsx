"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  LayoutDashboard,
  Calendar,
  PlaneTakeoff,
  Settings,
  Command,
  HelpCircle,
} from "lucide-react";
import CommandBar from "@/components/command-bar";
import Link from "next/link";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home", shortcut: "1" },
  { href: "/flights", icon: Calendar, label: "Flights", shortcut: "2" },
  { href: "/aircraft", icon: PlaneTakeoff, label: "Aircraft", shortcut: "3" },
  { href: "/settings", icon: Settings, label: "Settings", shortcut: "," },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K to open command bar
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen(true);
      }

      // Cmd+number for navigation
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const item = navItems.find((n) => n.shortcut === e.key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }

      // Cmd+/ for help
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
      }

      // Escape to close alerts
      if (e.key === "Escape") {
        setCommandBarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleCommandSubmit = (message: string) => {
    // Route to home page with the message as a query param
    const encoded = encodeURIComponent(message);
    router.push(`/?q=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-16 flex-col items-center py-4 border-r border-surface-400 bg-surface-100">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-6">
          <Plane className="w-5 h-5 text-brand-400" />
        </div>

        {/* Nav items */}
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
                {/* Tooltip */}
                <div className="absolute left-14 px-2 py-1 bg-surface-300 border border-surface-400 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                  <span className="ml-2 text-gray-500 font-mono">
                    {"\u2318"}{item.shortcut}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1">
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
      <main className="flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-surface-400">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-brand-400" />
            <span className="text-body font-semibold text-white">Aeros</span>
          </div>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center text-gray-400"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 border-t border-surface-400 bg-surface-100/80 backdrop-blur-xl z-40">
          {navItems.slice(0, 4).map((item) => {
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
