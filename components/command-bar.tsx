"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, CloudSun, Calendar, AlertTriangle, BarChart3, X } from "lucide-react";

interface CommandBarProps {
  onSubmit: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  { icon: Calendar, label: "What flights today?", category: "Flights" },
  { icon: CloudSun, label: "Show me weather", category: "Weather" },
  { icon: AlertTriangle, label: "What needs attention?", category: "Alerts" },
  { icon: Sparkles, label: "Show aircraft status", category: "Aircraft" },
  { icon: BarChart3, label: "How much did we make this week?", category: "Revenue" },
];

const recentQueries = ["What flights today?", "Ground N12345", "Show revenue this week"];

export default function CommandBar({ onSubmit, isOpen, onClose }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = query
    ? suggestions.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      onSubmit(value.trim());
      setQuery("");
      onClose();
    },
    [onSubmit, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        handleSubmit(query);
      } else if (filteredSuggestions[selectedIndex]) {
        handleSubmit(filteredSuggestions[selectedIndex].label);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-surface-50 border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Aeros anything..."
                  className="flex-1 bg-transparent text-zinc-100 text-body placeholder:text-zinc-500 outline-none"
                />
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {!query && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-2">Recent</p>
                    {recentQueries.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(q)}
                        className="w-full text-left px-3 py-2 text-small text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-3 py-2">
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-2">
                    {query ? "Results" : "Suggestions"}
                  </p>
                  {filteredSuggestions.map((suggestion, i) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSubmit(suggestion.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          i === selectedIndex
                            ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-small">{suggestion.label}</span>
                        <span className="ml-auto text-xs text-zinc-600">{suggestion.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                <span className="text-xs text-zinc-500">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-zinc-400 font-mono text-[10px]">Enter</kbd> to select
                </span>
                <span className="text-xs text-zinc-500">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-zinc-400 font-mono text-[10px]">Esc</kbd> to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
