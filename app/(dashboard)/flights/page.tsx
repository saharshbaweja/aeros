"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter } from "lucide-react";
import { mockFlights } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import FlightTimeline from "@/components/flight-timeline";
import { Button } from "@/components/ui/button";

const filters = ["all", "scheduled", "completed", "cancelled"] as const;

export default function FlightsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const today = new Date().toISOString().split("T")[0];
  const filtered =
    activeFilter === "all"
      ? mockFlights
      : mockFlights.filter((f) => f.status === activeFilter);

  const scheduled = mockFlights.filter((f) => f.status === "scheduled").length;
  const completed = mockFlights.filter((f) => f.status === "completed").length;

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h1 className="text-heading text-zinc-100">Today&apos;s Flights</h1>
                <p className="text-small text-zinc-500">{formatDate(today)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div>
              <span className="text-display text-zinc-100">{scheduled}</span>
              <span className="text-small text-zinc-500 ml-2">scheduled</span>
            </div>
            <div className="w-px h-6 bg-white/[0.06]" />
            <div>
              <span className="text-display text-emerald-400">{completed}</span>
              <span className="text-small text-zinc-500 ml-2">completed</span>
            </div>
            <div className="w-px h-6 bg-white/[0.06]" />
            <div>
              <span className="text-display text-zinc-100">{mockFlights.length}</span>
              <span className="text-small text-zinc-500 ml-2">total</span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <Filter className="w-4 h-4 text-zinc-500" />
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter}
            </Button>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FlightTimeline flights={filtered} />
        </motion.div>
      </div>
    </div>
  );
}
