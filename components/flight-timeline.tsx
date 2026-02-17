"use client";

import { motion } from "framer-motion";
import { Plane, Clock, User } from "lucide-react";
import { Flight } from "@/types";
import { formatTime, getServiceTypeLabel, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FlightTimelineProps {
  flights: Flight[];
}

const statusBadge = {
  scheduled: "default",
  completed: "success",
  cancelled: "danger",
} as const;

export default function FlightTimeline({ flights }: FlightTimelineProps) {
  const sorted = [...flights].sort((a, b) =>
    a.flight_time.localeCompare(b.flight_time)
  );

  return (
    <div className="space-y-3">
      {sorted.map((flight, i) => (
        <motion.div
          key={flight.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative flex gap-4 p-4 bg-surface-200 border border-surface-400 rounded-xl hover:border-surface-500 transition-all cursor-pointer"
        >
          {/* Time column */}
          <div className="w-16 shrink-0 text-center">
            <span className="font-mono text-body text-white font-semibold">
              {formatTime(flight.flight_time).split(" ")[0]}
            </span>
            <span className="block font-mono text-xs text-gray-500">
              {formatTime(flight.flight_time).split(" ")[1]}
            </span>
          </div>

          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mt-1 ${
                flight.status === "completed"
                  ? "bg-emerald-400"
                  : flight.status === "cancelled"
                  ? "bg-rose-400"
                  : "bg-brand-400"
              }`}
            />
            {i < sorted.length - 1 && (
              <div className="w-px flex-1 bg-surface-400 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-body text-white font-medium">
                {flight.customer_name}
              </span>
              <Badge variant={statusBadge[flight.status]}>
                {flight.status}
              </Badge>
            </div>

            <p className="text-small text-gray-400 mb-2">
              {getServiceTypeLabel(flight.service_type)}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Plane className="w-3 h-3" />
                <span className="font-mono">
                  {flight.aircraft?.tail_number || "TBD"}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {flight.duration_minutes} min
              </span>
              {flight.customer_email && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {flight.customer_email}
                </span>
              )}
            </div>
          </div>

          {/* Duration bar */}
          <div className="hidden sm:flex items-center">
            <div
              className={`h-2 rounded-full ${
                flight.status === "completed"
                  ? "bg-emerald-500/30"
                  : flight.status === "cancelled"
                  ? "bg-rose-500/30"
                  : "bg-brand-500/30"
              }`}
              style={{
                width: `${Math.min(flight.duration_minutes / 2, 80)}px`,
              }}
            />
          </div>
        </motion.div>
      ))}

      {flights.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Plane className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-body">No flights scheduled</p>
        </div>
      )}
    </div>
  );
}
