"use client";

import { motion } from "framer-motion";
import { PlaneTakeoff, Wrench, Clock, Gauge } from "lucide-react";
import { mockAircraft } from "@/lib/mock-data";
import { getStatusDot } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusBadge = {
  available: "success",
  flying: "info",
  maintenance: "danger",
} as const;

export default function AircraftPage() {
  const available = mockAircraft.filter((a) => a.status === "available").length;
  const flying = mockAircraft.filter((a) => a.status === "flying").length;
  const maintenance = mockAircraft.filter((a) => a.status === "maintenance").length;

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <PlaneTakeoff className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-heading text-white">Aircraft Fleet</h1>
              <p className="text-small text-gray-400">
                {mockAircraft.length} aircraft in fleet
              </p>
            </div>
          </div>

          {/* Status summary */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-small text-gray-400">
                {available} available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-small text-gray-400">
                {flying} flying
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-small text-gray-400">
                {maintenance} in maintenance
              </span>
            </div>
          </div>
        </motion.div>

        {/* Aircraft list */}
        <div className="space-y-3">
          {mockAircraft.map((aircraft, i) => {
            const hoursToOilChange = 50 - (aircraft.total_flight_hours - aircraft.last_oil_change_hours);
            const hoursTo100hr = 100 - (aircraft.total_flight_hours - aircraft.last_100hr_inspection_hours);
            const needsAttention = hoursToOilChange <= 10 || hoursTo100hr <= 10;

            return (
              <motion.div
                key={aircraft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-200 border border-surface-400 rounded-xl p-5 hover:border-surface-500 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusDot(
                        aircraft.status
                      )}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body text-white font-semibold">
                          {aircraft.tail_number}
                        </span>
                        <Badge variant={statusBadge[aircraft.status]}>
                          {aircraft.status}
                        </Badge>
                        {needsAttention && (
                          <Badge variant="warning">Attention</Badge>
                        )}
                      </div>
                      <p className="text-small text-gray-400 mt-0.5">
                        {aircraft.make} {aircraft.model}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {aircraft.category}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 ml-6">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        Total Hours
                      </p>
                      <p className="font-mono text-small text-white">
                        {aircraft.total_flight_hours.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        Oil Change
                      </p>
                      <p
                        className={`font-mono text-small ${
                          hoursToOilChange <= 10
                            ? "text-amber-400"
                            : "text-white"
                        }`}
                      >
                        in {hoursToOilChange}hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        100hr Insp
                      </p>
                      <p
                        className={`font-mono text-small ${
                          hoursTo100hr <= 10 ? "text-amber-400" : "text-white"
                        }`}
                      >
                        in {hoursTo100hr}hrs
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
