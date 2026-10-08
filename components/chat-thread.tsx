"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Network, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const starterQuestions = [
  "What changed for this mission?",
  "What if we leave 45 minutes later?",
  "Which downstream dependencies are exposed?",
];

export default function ChatThread({ messages, onSendMessage, isLoading }: ChatThreadProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const submit = () => {
    const question = input.trim();
    if (!question || isLoading) return;
    onSendMessage(question);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center">
            <div className="w-12 h-12 rounded-2xl border border-brand-400/15 bg-brand-500/[0.08] flex items-center justify-center">
              <Network className="w-5 h-5 text-brand-300" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-5">Ask the operation.</h3>
            <p className="text-xs leading-5 text-zinc-600 mt-2 max-w-[310px]">
              Ask Aeros reasons over the same mission state, specialist claims, evidence and constraints powering the command center.
            </p>
            <div className="space-y-2 mt-6">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onSendMessage(question)}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-white text-black"
                    : "border border-white/[0.06] bg-white/[0.035] text-zinc-300"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-brand-300" />
                    <span className="text-[9px] uppercase tracking-[0.14em] text-brand-300">Aeros</span>
                  </div>
                )}
                <div className="text-xs whitespace-pre-wrap leading-5">{message.content}</div>
                <div className={`text-[9px] mt-2 ${message.role === "user" ? "text-zinc-500" : "text-zinc-700"}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-brand-300" />
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.16 }}
                    className="w-1.5 h-1.5 rounded-full bg-brand-300"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 focus-within:border-brand-400/25 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about this mission..."
            rows={1}
            disabled={isLoading}
            className="min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-xs leading-5 text-zinc-200 placeholder:text-zinc-700 outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-25 transition-opacity flex-shrink-0"
            aria-label="Send to Aeros"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[8px] text-zinc-700 mt-2 px-1">Uses live context where connected. Missing inputs remain explicit.</div>
      </div>
    </div>
  );
}
