"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Map, Plane, Radio } from "lucide-react";
import { mockAircraft } from "@/lib/mock-data";

const FlightMap = dynamic(() => import("@/components/flight-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-small text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const flyingCount = mockAircraft.filter((a) => a.status === "flying").length;
  const totalCount = mockAircraft.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-400 bg-surface-100/50 backdrop-blur-sm z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Map className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-heading text-white">Flight Map</h1>
            <p className="text-small text-gray-400">
              Live ADS-B aircraft tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-small text-gray-400">
              <span className="text-cyan-400 font-semibold">{flyingCount}</span>{" "}
              / {totalCount} in flight
            </span>
          </div>
        </div>
      </motion.div>

      {/* Map */}
      <div className="flex-1">
        <FlightMap />
      </div>
    </div>
  );
}
