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
  { key: "pre-brief", label: "Pre-Brief", color: "text-amber-500" },
  { key: "dispatched", label: "Dispatched", color: "text-brand-400" },
  { key: "airborne", label: "Airborne", color: "text-sky-500" },
  { key: "landed", label: "Landed", color: "text-emerald-500" },
  { key: "closed", label: "Closed", color: "text-zinc-500" },
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

  return (
    <div className="h-screen flex overflow-hidden">
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
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h1 className="text-heading text-zinc-100">Dispatch Board</h1>
                  <p className="text-small text-zinc-400">
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
                          ? "text-emerald-500"
                          : mockWeather.flight_category === "MVFR"
                          ? "text-amber-500"
                          : "text-rose-500"
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
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-zinc-400">
                  Pre-brief:{" "}
                  <span className="text-zinc-100 font-semibold">
                    {
                      grouped.active.filter(
                        (f) => f.dispatch_status === "pre-brief"
                      ).length
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                <span className="text-zinc-400">
                  Dispatched:{" "}
                  <span className="text-zinc-100 font-semibold">
                    {
                      grouped.active.filter(
                        (f) => f.dispatch_status === "dispatched"
                      ).length
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-zinc-400">
                  Airborne:{" "}
                  <span className="text-sky-500 font-semibold">
                    {airborne.length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-zinc-400">
                  Closed:{" "}
                  <span className="text-zinc-100 font-semibold">
                    {grouped.closed.length}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Active flights */}
          <div className="space-y-2 mb-8">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Active Operations ({grouped.active.length})
            </h2>
            {grouped.active
              .sort((a, b) => a.flight_time.localeCompare(b.flight_time))
              .map((flight, i) => {
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
                    className={`bg-white/[0.04] backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-300 ring-1 ring-brand-200"
                        : "border-white/[0.06] hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="w-16 flex-shrink-0">
                        <span className="font-mono text-sm font-semibold text-zinc-100">
                          {formatTime(flight.flight_time)}
                        </span>
                        <p className="font-mono text-[10px] text-zinc-500">
                          {flight.duration_minutes}min
                        </p>
                      </div>

                      {/* Status badge */}
                      <div
                        className={`w-20 flex-shrink-0 text-center py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          flight.dispatch_status === "pre-brief"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : flight.dispatch_status === "dispatched"
                            ? "bg-brand-500/20 text-brand-400 border border-brand-500/20"
                            : flight.dispatch_status === "airborne"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {flight.dispatch_status}
                      </div>

                      {/* Flight info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-100 font-medium truncate">
                            {flight.customer_name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] text-zinc-400 rounded border border-white/[0.06]">
                            {getServiceTypeLabel(flight.service_type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="font-mono text-xs text-zinc-400">
                            {flight.aircraft?.tail_number}
                          </span>
                          {flight.instructor && (
                            <span className="text-xs text-zinc-500">
                              CFI: {flight.instructor}
                            </span>
                          )}
                          {flight.fuel_required && (
                            <span className="text-xs text-zinc-500">
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
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all"
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
                              ? "bg-sky-500/15 text-sky-400 border border-sky-500/20 hover:bg-sky-500/25"
                              : flight.dispatch_status === "airborne"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                              : "bg-white/[0.06] text-zinc-500"
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
                          <div className="mt-3 pt-3 border-t border-white/[0.06]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                  Customer
                                </p>
                                <p className="text-xs text-zinc-100">
                                  {flight.customer_name}
                                </p>
                                {flight.customer_email && (
                                  <p className="text-[10px] text-zinc-400">
                                    {flight.customer_email}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                  Aircraft
                                </p>
                                <p className="text-xs text-zinc-100 font-mono">
                                  {flight.aircraft?.tail_number}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {flight.aircraft?.make}{" "}
                                  {flight.aircraft?.model}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                  Service
                                </p>
                                <p className="text-xs text-zinc-100">
                                  {getServiceTypeLabel(flight.service_type)}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {flight.duration_minutes} minutes
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                  Weather
                                </p>
                                <p className="text-xs text-zinc-100">
                                  {mockWeather.flight_category}
                                </p>
                                <p className="text-[10px] text-zinc-400">
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
                              <div className="mb-3 p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                  Notes
                                </p>
                                <pre className="text-xs text-zinc-300 font-sans whitespace-pre-wrap">
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
                                  className="flex-1 bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 rounded-lg px-3 py-1.5 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addNote(flight.id);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 transition-all"
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelFlight(flight.id);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs text-rose-400 bg-rose-500/15 border border-rose-500/20 hover:bg-rose-500/25 transition-all"
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
                <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">
                  All flights closed for today
                </p>
              </div>
            )}
          </div>

          {/* Closed flights */}
          {grouped.closed.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Closed ({grouped.closed.length})
              </h2>
              <div className="space-y-1.5">
                {grouped.closed.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center gap-4 px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg opacity-60"
                  >
                    <span className="font-mono text-xs text-zinc-500 w-14">
                      {formatTime(flight.flight_time)}
                    </span>
                    {flight.status === "cancelled" ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded font-medium">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded font-medium">
                        CLOSED
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 flex-1">
                      {flight.customer_name}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
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
