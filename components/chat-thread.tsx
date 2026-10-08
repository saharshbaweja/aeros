"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, FileSearch2 } from "lucide-react";
import type { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const starterQuestions = [
  "What changed for this mission?",
  "What changes if we leave 45 minutes later?",
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
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="pt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025]">
              <FileSearch2 className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-100">Ask about this operation</h3>
            <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-zinc-600">
              Answers use the same mission context, evidence and constraints shown in the command center. Missing information stays explicit.
            </p>
            <div className="mt-5 border-t border-white/[0.06]">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onSendMessage(question)}
                  className="group flex w-full items-center justify-between gap-3 border-b border-white/[0.05] py-3 text-left text-[11px] text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  <span>{question}</span>
                  <span className="text-zinc-800 transition-colors group-hover:text-zinc-500">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={message.role === "user" ? "pl-8" : "pr-4"}
            >
              <div className="mb-1.5 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-700">
                {message.role === "user" ? "You" : "Aeros"}
                <span className="font-mono font-normal normal-case tracking-normal text-zinc-800">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div
                className={`text-xs leading-5 ${
                  message.role === "user"
                    ? "rounded-lg border border-white/[0.07] bg-white/[0.04] px-3.5 py-3 text-zinc-300"
                    : "whitespace-pre-wrap text-zinc-300"
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="pr-4">
            <div className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-700">Aeros</div>
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ opacity: [0.18, 0.8, 0.18] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.14 }}
                  className="h-1 w-1 rounded-full bg-zinc-500"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-lg border border-white/[0.09] bg-black/20 p-2 transition-colors focus-within:border-white/[0.16]">
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
            placeholder="Ask about Mission 142…"
            rows={1}
            disabled={isLoading}
            className="min-h-10 w-full resize-none bg-transparent px-1.5 py-1.5 text-xs leading-5 text-zinc-200 outline-none placeholder:text-zinc-700"
          />
          <div className="flex items-center justify-between gap-3 px-1 pt-1">
            <span className="text-[8px] text-zinc-800">Enter to send · Shift+Enter for new line</span>
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim() || isLoading}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 transition-opacity disabled:opacity-20"
              aria-label="Send to Aeros"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
