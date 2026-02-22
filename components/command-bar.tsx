"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plane, CloudSun, Calendar, AlertTriangle, BarChart3, X } from "lucide-react";

interface CommandBarProps {
  onSubmit: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  { icon: Calendar, label: "What flights today?", category: "Flights" },
  { icon: CloudSun, label: "Show me weather", category: "Weather" },
  { icon: AlertTriangle, label: "What needs attention?", category: "Alerts" },
  { icon: Plane, label: "Show aircraft status", category: "Aircraft" },
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
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Aeros anything..."
                  className="flex-1 bg-transparent text-slate-800 text-body placeholder:text-slate-400 outline-none"
                />
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {!query && (
                  <div className="px-3 py-2">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Recent</p>
                    {recentQueries.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(q)}
                        className="w-full text-left px-3 py-2 text-small text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-3 py-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                    {query ? "Results" : "Suggestions"}
                  </p>
                  {filteredSuggestions.map((suggestion, i) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSubmit(suggestion.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          i === selectedIndex
                            ? "bg-brand-50 text-brand-600 border border-brand-200"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-small">{suggestion.label}</span>
                        <span className="ml-auto text-xs text-slate-400">{suggestion.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono text-[10px]">Enter</kbd> to select
                </span>
                <span className="text-xs text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono text-[10px]">Esc</kbd> to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
