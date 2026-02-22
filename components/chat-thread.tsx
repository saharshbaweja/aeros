"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plane } from "lucide-react";
import { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatThread({ messages, onSendMessage, isLoading }: ChatThreadProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 border border-brand-200">
              <Plane className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-slate-600 text-body mb-1">Start a conversation with Aeros</p>
            <p className="text-slate-400 text-small">Ask about flights, weather, aircraft, or anything else</p>
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
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                      <Plane className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-brand-500 font-medium">Aeros</span>
                  </div>
                )}
                <div className="text-small whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className={`text-[10px] mt-1 ${message.role === "user" ? "text-brand-200" : "text-slate-400"}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <Plane className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-brand-500 font-medium">Aeros</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-slate-400" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-slate-400" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-body text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-brand-500/25"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
