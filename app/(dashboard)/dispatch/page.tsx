"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Plane,
  User,
  Phone,
  Mail,
  Send,
  ArrowRightLeft,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { mockFlights, mockAircraft, mockWeather } from "@/lib/mock-data";
import { formatTime, getServiceTypeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Flight } from "@/types";

type DispatchStatus = "pre-brief" | "dispatched" | "airborne" | "landed" | "closed";

interface DispatchFlight extends Flight {
  dispatch_status: DispatchStatus;
  instructor?: string;
  fuel_required?: string;
  squawks?: string;
  dispatch_notes?: string;
}

const dispatchSteps: { key: DispatchStatus; label: string; color: string }[] = [
  { key: "pre-brief", label: "Pre-Brief", color: "text-amber-400" },
  { key: "dispatched", label: "Dispatched", color: "text-brand-400" },
  { key: "airborne", label: "Airborne", color: "text-cyan-400" },
  { key: "landed", label: "Landed", color: "text-emerald-400" },
  { key: "closed", label: "Closed", color: "text-gray-400" },
];

export default function DispatchPage() {
  const [flights, setFlights] = useState<DispatchFlight[]>(
    mockFlights.map((f) => ({
      ...f,
      dispatch_status:
        f.status === "completed"
          ? "closed"
          : "pre-brief",
      instructor:
        f.service_type === "lesson" || f.service_type === "discovery"
          ? ["Capt. Torres", "Sarah Chen", "Mike Rodriguez"][
              Math.floor(Math.random() * 3)
            ]
          : undefined,
      fuel_required: ["Tabs", "Full", "30 gal", "Tabs + 10"][
        Math.floor(Math.random() * 4)
      ],
    }))
  );

  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const advanceStatus = (flightId: string) => {
    setFlights((prev) =>
      prev.map((f) => {
        if (f.id !== flightId) return f;
        const currentIdx = dispatchSteps.findIndex(
          (s) => s.key === f.dispatch_status
        );
        if (currentIdx < dispatchSteps.length - 1) {
          return {
            ...f,
            dispatch_status: dispatchSteps[currentIdx + 1].key,
          };
        }
        return f;
      })
    );
  };

  const revertStatus = (flightId: string) => {
    setFlights((prev) =>
      prev.map((f) => {
        if (f.id !== flightId) return f;
        const currentIdx = dispatchSteps.findIndex(
          (s) => s.key === f.dispatch_status
        );
        if (currentIdx > 0) {
          return {
            ...f,
            dispatch_status: dispatchSteps[currentIdx - 1].key,
          };
        }
        return f;
      })
    );
  };

  const addNote = (flightId: string) => {
    if (!noteInput.trim()) return;
    setFlights((prev) =>
      prev.map((f) => {
        if (f.id !== flightId) return f;
        const existing = f.dispatch_notes || "";
        const time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          ...f,
          dispatch_notes: existing
            ? `${existing}\n[${time}] ${noteInput}`
            : `[${time}] ${noteInput}`,
        };
      })
    );
    setNoteInput("");
  };

  const cancelFlight = (flightId: string) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flightId
          ? { ...f, status: "cancelled" as const, dispatch_status: "closed" as DispatchStatus }
          : f
      )
    );
  };

  const grouped = {
    active: flights.filter(
      (f) =>
        f.dispatch_status !== "closed" && f.status !== "cancelled"
    ),
    closed: flights.filter(
      (f) => f.dispatch_status === "closed" || f.status === "cancelled"
    ),
  };

  const airborne = flights.filter((f) => f.dispatch_status === "airborne");
  const selected = flights.find((f) => f.id === selectedFlight);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Main dispatch board */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h1 className="text-heading text-white">Dispatch Board</h1>
                  <p className="text-small text-gray-400">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                    {" "}
                    &bull; KPDK &bull;{" "}
                    <span
                      className={
                        mockWeather.flight_category === "VFR"
                          ? "text-emerald-400"
                          : mockWeather.flight_category === "MVFR"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }
                    >
                      {mockWeather.flight_category}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick status bar */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-200 border border-surface-400 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-gray-400">
                  Pre-brief:{" "}
                  <span className="text-white font-semibold">
                    {
                      grouped.active.filter(
                        (f) => f.dispatch_status === "pre-brief"
                      ).length
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-200 border border-surface-400 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="text-gray-400">
                  Dispatched:{" "}
                  <span className="text-white font-semibold">
                    {
                      grouped.active.filter(
                        (f) => f.dispatch_status === "dispatched"
                      ).length
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-200 border border-surface-400 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-gray-400">
                  Airborne:{" "}
                  <span className="text-cyan-400 font-semibold">
                    {airborne.length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-200 border border-surface-400 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-gray-400">
                  Closed:{" "}
                  <span className="text-white font-semibold">
                    {grouped.closed.length}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Active flights */}
          <div className="space-y-2 mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Active Operations ({grouped.active.length})
            </h2>
            {grouped.active
              .sort((a, b) => a.flight_time.localeCompare(b.flight_time))
              .map((flight, i) => {
                const step = dispatchSteps.find(
                  (s) => s.key === flight.dispatch_status
                )!;
                const isSelected = selectedFlight === flight.id;

                return (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() =>
                      setSelectedFlight(isSelected ? null : flight.id)
                    }
                    className={`bg-surface-200 border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-500/50 ring-1 ring-brand-500/20"
                        : "border-surface-400 hover:border-surface-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="w-16 flex-shrink-0">
                        <span className="font-mono text-sm font-semibold text-white">
                          {formatTime(flight.flight_time)}
                        </span>
                        <p className="font-mono text-[10px] text-gray-600">
                          {flight.duration_minutes}min
                        </p>
                      </div>

                      {/* Status badge */}
                      <div
                        className={`w-20 flex-shrink-0 text-center py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          flight.dispatch_status === "pre-brief"
                            ? "bg-amber-500/15 text-amber-400"
                            : flight.dispatch_status === "dispatched"
                            ? "bg-brand-500/15 text-brand-400"
                            : flight.dispatch_status === "airborne"
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {flight.dispatch_status}
                      </div>

                      {/* Flight info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium truncate">
                            {flight.customer_name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-surface-300 text-gray-500 rounded">
                            {getServiceTypeLabel(flight.service_type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="font-mono text-xs text-gray-500">
                            {flight.aircraft?.tail_number}
                          </span>
                          {flight.instructor && (
                            <span className="text-xs text-gray-600">
                              CFI: {flight.instructor}
                            </span>
                          )}
                          {flight.fuel_required && (
                            <span className="text-xs text-gray-600">
                              Fuel: {flight.fuel_required}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            revertStatus(flight.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-surface-300 transition-all"
                          title="Revert status"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceStatus(flight.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            flight.dispatch_status === "pre-brief"
                              ? "bg-brand-500 text-white hover:bg-brand-600"
                              : flight.dispatch_status === "dispatched"
                              ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                              : flight.dispatch_status === "airborne"
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-surface-300 text-gray-400"
                          }`}
                        >
                          {flight.dispatch_status === "pre-brief"
                            ? "Dispatch"
                            : flight.dispatch_status === "dispatched"
                            ? "Takeoff"
                            : flight.dispatch_status === "airborne"
                            ? "Landed"
                            : "Close"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-surface-400/50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                                  Customer
                                </p>
                                <p className="text-xs text-white">
                                  {flight.customer_name}
                                </p>
                                {flight.customer_email && (
                                  <p className="text-[10px] text-gray-500">
                                    {flight.customer_email}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                                  Aircraft
                                </p>
                                <p className="text-xs text-white font-mono">
                                  {flight.aircraft?.tail_number}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {flight.aircraft?.make}{" "}
                                  {flight.aircraft?.model}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                                  Service
                                </p>
                                <p className="text-xs text-white">
                                  {getServiceTypeLabel(flight.service_type)}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {flight.duration_minutes} minutes
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                                  Weather
                                </p>
                                <p className="text-xs text-white">
                                  {mockWeather.flight_category}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Wind {mockWeather.wind_direction}@
                                  {mockWeather.wind_speed}
                                  {mockWeather.wind_gust
                                    ? `G${mockWeather.wind_gust}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            {/* Dispatch notes */}
                            {flight.dispatch_notes && (
                              <div className="mb-3 p-2.5 bg-surface-300/50 rounded-lg">
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
                                  Notes
                                </p>
                                <pre className="text-xs text-gray-300 font-sans whitespace-pre-wrap">
                                  {flight.dispatch_notes}
                                </pre>
                              </div>
                            )}

                            {/* Actions bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") addNote(flight.id);
                                  }}
                                  placeholder="Add dispatch note..."
                                  className="flex-1 bg-surface-300 border border-surface-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-500/50 placeholder:text-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addNote(flight.id);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 transition-all"
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelFlight(flight.id);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                              >
                                Cancel Flight
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

            {grouped.active.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  All flights closed for today
                </p>
              </div>
            )}
          </div>

          {/* Closed flights */}
          {grouped.closed.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Closed ({grouped.closed.length})
              </h2>
              <div className="space-y-1.5">
                {grouped.closed.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center gap-4 px-4 py-2.5 bg-surface-200/50 border border-surface-400/50 rounded-lg opacity-60"
                  >
                    <span className="font-mono text-xs text-gray-500 w-14">
                      {formatTime(flight.flight_time)}
                    </span>
                    {flight.status === "cancelled" ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded font-medium">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-medium">
                        CLOSED
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex-1">
                      {flight.customer_name}
                    </span>
                    <span className="font-mono text-[10px] text-gray-600">
                      {flight.aircraft?.tail_number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
