"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowUp } from "lucide-react";
import { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatThread({ messages, onSendMessage, isLoading }: ChatThreadProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-5 border border-white/[0.08]">
              <Sparkles className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-zinc-200 text-body font-medium mb-2">Aeros Flight Copilot</p>
            <p className="text-zinc-500 text-small max-w-[280px]">
              Ask about flights, weather, aircraft status, or give operational commands
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {["What flights today?", "Weather check", "Fleet status"].map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(q)}
                  className="px-3 py-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.08] hover:text-zinc-200 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-white/[0.06] text-zinc-200 border border-white/[0.06]"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[11px] text-brand-400 font-medium">Aeros</span>
                  </div>
                )}
                <div className="text-small whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className={`text-[10px] mt-1.5 ${message.role === "user" ? "text-brand-200" : "text-zinc-500"}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[11px] text-brand-400 font-medium">Aeros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aeros anything..."
              rows={1}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-body text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-brand-500/25 flex-shrink-0"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
