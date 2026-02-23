"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CloudRain, Wrench, X, ChevronRight } from "lucide-react";
import { Alert } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string) => void;
  onAction: (id: string, action: string) => void;
}

const alertIcons = {
  maintenance: Wrench,
  weather: CloudRain,
  safety: AlertTriangle,
};

const priorityVariants = {
  low: "neutral",
  medium: "warning",
  high: "danger",
  critical: "danger",
} as const;

export default function AlertCard({ alert, onDismiss, onAction }: AlertCardProps) {
  const Icon = alertIcons[alert.alert_type] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass rounded-2xl p-4 w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              alert.priority === "critical" || alert.priority === "high"
                ? "bg-rose-500/20"
                : alert.alert_type === "weather"
                ? "bg-amber-500/20"
                : "bg-brand-500/20"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                alert.priority === "critical" || alert.priority === "high"
                  ? "text-rose-400"
                  : alert.alert_type === "weather"
                  ? "text-amber-400"
                  : "text-brand-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {alert.alert_type}
              </span>
              <Badge variant={priorityVariants[alert.priority]}>
                {alert.priority}
              </Badge>
            </div>
            <p className="text-small text-zinc-300 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 ml-11">
        <button
          onClick={() => onAction(alert.id, "handle")}
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          Handle this
          <ChevronRight className="w-3 h-3" />
        </button>
        <span className="text-zinc-700">|</span>
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
