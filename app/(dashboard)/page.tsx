"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, PlaneTakeoff, BarChart3, Plane } from "lucide-react";
import { mockFlights, mockAlerts, mockAircraft, mockWeather } from "@/lib/mock-data";
import { getGreeting, formatTime, getServiceTypeLabel } from "@/lib/utils";
import AlertCard from "@/components/alert-card";
import WeatherCard from "@/components/weather-card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [alerts, setAlerts] = useState(mockAlerts.filter((a) => a.status === "active"));

  const scheduledFlights = mockFlights.filter((f) => f.status === "scheduled");
  const completedFlights = mockFlights.filter((f) => f.status === "completed");
  const totalRevenue = (scheduledFlights.length * 245 + completedFlights.length * 280);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAlertAction = (id: string, action: string) => {
    handleDismissAlert(id);
  };

  return (
    <div className="h-[calc(100vh-0px)] md:h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h1 className="text-heading text-white">
                  {getGreeting()}, Sarah.
                </h1>
                <p className="text-small text-gray-400">
                  Here&apos;s what needs your attention:
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <Link
              href="/flights"
              className="bg-surface-200 border border-surface-400 rounded-xl p-4 hover:border-surface-500 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                  Flights
                </span>
              </div>
              <p className="text-display text-white">{scheduledFlights.length}</p>
            </Link>

            <div className="bg-surface-200 border border-surface-400 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <p className="text-display text-white font-mono">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>

            <Link
              href="/aircraft"
              className="bg-surface-200 border border-surface-400 rounded-xl p-4 hover:border-surface-500 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <PlaneTakeoff className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                  Aircraft
                </span>
              </div>
              <p className="text-display text-white">
                {mockAircraft.filter((a) => a.status === "available").length}/
                {mockAircraft.length}
              </p>
            </Link>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 mb-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Active Alerts
                </h2>
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismissAlert}
                    onAction={handleAlertAction}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <WeatherCard weather={mockWeather} />
          </motion.div>

          {/* Quick flights preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-200 border border-surface-400 rounded-xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subheading text-white">Upcoming Flights</h3>
              <Link
                href="/flights"
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {scheduledFlights.slice(0, 3).map((flight) => (
                <div
                  key={flight.id}
                  className="flex items-center gap-3 py-2 border-b border-surface-400 last:border-0"
                >
                  <span className="font-mono text-small text-brand-400 w-16">
                    {formatTime(flight.flight_time)}
                  </span>
                  <span className="font-mono text-xs text-gray-500 w-16">
                    {flight.aircraft?.tail_number}
                  </span>
                  <span className="text-small text-white flex-1">
                    {flight.customer_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getServiceTypeLabel(flight.service_type)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-gray-600">Quick actions:</span>
            {[
              { label: "Today's flights", href: "/flights" },
              { label: "Track aircraft", href: "/map" },
              { label: "View pricing", href: "/pricing" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="px-3 py-1.5 bg-surface-300 border border-surface-400 rounded-lg text-xs text-gray-400 hover:text-white hover:border-surface-500 transition-all"
              >
                {action.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
