"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  PlaneTakeoff,
  Users,
  TrendingUp,
  Radio,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import {
  mockFlights,
  mockAlerts,
  mockAircraft,
  mockWeather,
} from "@/lib/mock-data";
import { getGreeting, formatTime, getServiceTypeLabel } from "@/lib/utils";
import AlertCard from "@/components/alert-card";
import WeatherCard from "@/components/weather-card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [alerts, setAlerts] = useState(
    mockAlerts.filter((a) => a.status === "active")
  );

  const scheduledFlights = mockFlights.filter((f) => f.status === "scheduled");
  const completedFlights = mockFlights.filter((f) => f.status === "completed");
  const flyingAircraft = mockAircraft.filter((a) => a.status === "flying");

  const todayRevenue = completedFlights.length * 280 + scheduledFlights.length * 245;
  const utilizationRate = Math.round(
    ((flyingAircraft.length + scheduledFlights.length) /
      Math.max(mockAircraft.length, 1)) *
      100
  );

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAlertAction = (id: string, action: string) => {
    handleDismissAlert(id);
  };

  const nextFlights = scheduledFlights
    .sort((a, b) => a.flight_time.localeCompare(b.flight_time))
    .slice(0, 4);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-heading text-slate-800">
                {getGreeting()}
              </h1>
            </div>
            <p className="text-small text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              &bull; KPDK &bull; SkyHaven FBO
            </p>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Link
              href="/dispatch"
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-slate-800 font-mono">
                {scheduledFlights.length}
              </p>
              <p className="text-[11px] text-slate-500">Flights today</p>
            </Link>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-2xl font-semibold text-slate-800 font-mono">
                ${todayRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">Today&apos;s revenue</p>
            </div>

            <Link
              href="/aircraft"
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <PlaneTakeoff className="w-4 h-4 text-sky-500" />
                <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-slate-800 font-mono">
                {utilizationRate}%
              </p>
              <p className="text-[11px] text-slate-500">Fleet utilization</p>
            </Link>

            <Link
              href="/customers"
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-amber-500" />
                <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-slate-800 font-mono">8</p>
              <p className="text-[11px] text-slate-500">Active customers</p>
            </Link>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 mb-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Alerts requiring action
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

          {/* Next flights */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-xl p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Next Up</h3>
              <Link
                href="/dispatch"
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors"
              >
                Dispatch board
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {nextFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg"
                >
                  <div className="w-14 text-center">
                    <span className="font-mono text-xs font-semibold text-brand-500">
                      {formatTime(flight.flight_time)}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700 truncate">
                        {flight.customer_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                        {getServiceTypeLabel(flight.service_type)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {flight.aircraft?.tail_number} &bull;{" "}
                      {flight.duration_minutes}min
                    </span>
                  </div>
                  <Link
                    href="/dispatch"
                    className="px-2.5 py-1 bg-brand-50 text-brand-500 rounded-lg text-[10px] font-medium hover:bg-brand-100 transition-all border border-brand-200"
                  >
                    Dispatch
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fleet status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-xl p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Fleet</h3>
              <Link
                href="/aircraft"
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors"
              >
                Manage fleet
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockAircraft.map((ac) => (
                <div
                  key={ac.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      ac.status === "available"
                        ? "bg-emerald-400"
                        : ac.status === "flying"
                        ? "bg-sky-400 animate-pulse"
                        : "bg-rose-400"
                    }`}
                  />
                  <div>
                    <p className="font-mono text-xs text-slate-700">
                      {ac.tail_number}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {ac.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <WeatherCard weather={mockWeather} />
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-xl p-5 mt-4"
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              {[
                { label: "Open dispatch board", href: "/dispatch", icon: Radio, color: "text-brand-500" },
                { label: "Track flights on map", href: "/map", icon: PlaneTakeoff, color: "text-sky-500" },
                { label: "Manage fleet", href: "/aircraft", icon: PlaneTakeoff, color: "text-emerald-500" },
                { label: "View customers", href: "/customers", icon: Users, color: "text-amber-500" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all group"
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                  <span className="text-xs text-slate-500 group-hover:text-slate-800 transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
