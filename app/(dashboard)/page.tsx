"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  PlaneTakeoff,
  BarChart3,
  Plane,
  Users,
  TrendingUp,
  AlertTriangle,
  Radio,
  Clock,
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
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
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
  const availableAircraft = mockAircraft.filter(
    (a) => a.status === "available"
  );
  const maintenanceAircraft = mockAircraft.filter(
    (a) => a.status === "maintenance"
  );

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

  // Next 3 upcoming flights
  const nextFlights = scheduledFlights
    .sort((a, b) => a.flight_time.localeCompare(b.flight_time))
    .slice(0, 4);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-heading text-white">
                {getGreeting()}
              </h1>
            </div>
            <p className="text-small text-gray-500">
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
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            <Link
              href="/dispatch"
              className="bg-surface-200 border border-surface-400 rounded-xl p-4 hover:border-surface-500 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-white font-mono">
                {scheduledFlights.length}
              </p>
              <p className="text-[11px] text-gray-500">Flights today</p>
            </Link>

            <div className="bg-surface-200 border border-surface-400 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-2xl font-semibold text-white font-mono">
                ${todayRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500">Today&apos;s revenue</p>
            </div>

            <Link
              href="/aircraft"
              className="bg-surface-200 border border-surface-400 rounded-xl p-4 hover:border-surface-500 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <PlaneTakeoff className="w-4 h-4 text-cyan-400" />
                <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-white font-mono">
                {utilizationRate}%
              </p>
              <p className="text-[11px] text-gray-500">Fleet utilization</p>
            </Link>

            <Link
              href="/customers"
              className="bg-surface-200 border border-surface-400 rounded-xl p-4 hover:border-surface-500 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-amber-400" />
                <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-white font-mono">8</p>
              <p className="text-[11px] text-gray-500">Active customers</p>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Left column: Alerts + Weather */}
            <div className="md:col-span-2 space-y-4">
              {/* Alerts */}
              <AnimatePresence>
                {alerts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                className="bg-surface-200 border border-surface-400 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">
                    Next Up
                  </h3>
                  <Link
                    href="/dispatch"
                    className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Dispatch board
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {nextFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center gap-3 p-2.5 bg-surface-300/30 rounded-lg"
                    >
                      <div className="w-14 text-center">
                        <span className="font-mono text-xs font-semibold text-brand-400">
                          {formatTime(flight.flight_time)}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-surface-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white truncate">
                            {flight.customer_name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-surface-300 text-gray-500 rounded">
                            {getServiceTypeLabel(flight.service_type)}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-600">
                          {flight.aircraft?.tail_number} &bull;{" "}
                          {flight.duration_minutes}min
                        </span>
                      </div>
                      <Link
                        href="/dispatch"
                        className="px-2.5 py-1 bg-brand-500/10 text-brand-400 rounded-lg text-[10px] font-medium hover:bg-brand-500/20 transition-all"
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
                className="bg-surface-200 border border-surface-400 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Fleet</h3>
                  <Link
                    href="/aircraft"
                    className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Manage fleet
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {mockAircraft.map((ac) => (
                    <div
                      key={ac.id}
                      className="flex items-center gap-2 p-2 bg-surface-300/30 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          ac.status === "available"
                            ? "bg-emerald-400"
                            : ac.status === "flying"
                            ? "bg-cyan-400 animate-pulse"
                            : "bg-rose-400"
                        }`}
                      />
                      <div>
                        <p className="font-mono text-xs text-white">
                          {ac.tail_number}
                        </p>
                        <p className="text-[10px] text-gray-600 capitalize">
                          {ac.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right column: Weather + Quick actions */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <WeatherCard weather={mockWeather} />
              </motion.div>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-surface-200 border border-surface-400 rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1.5">
                  {[
                    {
                      label: "Open dispatch board",
                      href: "/dispatch",
                      icon: Radio,
                      color: "text-brand-400",
                    },
                    {
                      label: "Track flights on map",
                      href: "/map",
                      icon: Plane,
                      color: "text-cyan-400",
                    },
                    {
                      label: "Manage fleet",
                      href: "/aircraft",
                      icon: PlaneTakeoff,
                      color: "text-emerald-400",
                    },
                    {
                      label: "View customers",
                      href: "/customers",
                      icon: Users,
                      color: "text-amber-400",
                    },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-300 transition-all group"
                    >
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
