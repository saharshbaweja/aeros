"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  CloudSun,
  Fuel,
  Plane,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { mockFlights, mockWeather } from "@/lib/mock-data";
import { formatTime, getServiceTypeLabel } from "@/lib/utils";
import type { Flight } from "@/types";

type DispatchStatus = "pre-brief" | "dispatched" | "airborne" | "landed" | "closed";

interface DispatchFlight extends Flight {
  dispatch_status: DispatchStatus;
  instructor?: string;
  fuel_required?: string;
  dispatch_notes?: string;
}

const statusOrder: DispatchStatus[] = ["pre-brief", "dispatched", "airborne", "landed", "closed"];
const instructors = ["Capt. Torres", "Sarah Chen", "Mike Rodriguez"];
const fuelPlans = ["Tabs", "Full", "30 gal", "Tabs + 10"];

export default function DispatchPage() {
  const [flights, setFlights] = useState<DispatchFlight[]>(() =>
    mockFlights.map((flight, index) => ({
      ...flight,
      dispatch_status: flight.status === "completed" ? "closed" : "pre-brief",
      instructor:
        flight.service_type === "lesson" || flight.service_type === "discovery"
          ? instructors[index % instructors.length]
          : undefined,
      fuel_required: fuelPlans[index % fuelPlans.length],
    }))
  );
  const [selectedFlightId, setSelectedFlightId] = useState<string>(() => {
    return mockFlights.find((flight) => flight.status !== "completed")?.id || mockFlights[0]?.id || "";
  });
  const [noteInput, setNoteInput] = useState("");

  const activeFlights = useMemo(
    () =>
      flights
        .filter((flight) => flight.dispatch_status !== "closed" && flight.status !== "cancelled")
        .sort((a, b) => a.flight_time.localeCompare(b.flight_time)),
    [flights]
  );
  const closedFlights = flights.filter(
    (flight) => flight.dispatch_status === "closed" || flight.status === "cancelled"
  );
  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) || activeFlights[0] || flights[0];

  const countFor = (status: DispatchStatus) => flights.filter((flight) => flight.dispatch_status === status).length;

  const advanceStatus = (flightId: string) => {
    setFlights((current) =>
      current.map((flight) => {
        if (flight.id !== flightId) return flight;
        const index = statusOrder.indexOf(flight.dispatch_status);
        if (index >= statusOrder.length - 1) return flight;
        return { ...flight, dispatch_status: statusOrder[index + 1] };
      })
    );
  };

  const revertStatus = (flightId: string) => {
    setFlights((current) =>
      current.map((flight) => {
        if (flight.id !== flightId) return flight;
        const index = statusOrder.indexOf(flight.dispatch_status);
        if (index <= 0) return flight;
        return { ...flight, dispatch_status: statusOrder[index - 1] };
      })
    );
  };

  const cancelFlight = (flightId: string) => {
    setFlights((current) =>
      current.map((flight) =>
        flight.id === flightId
          ? { ...flight, status: "cancelled" as const, dispatch_status: "closed" as DispatchStatus }
          : flight
      )
    );
  };

  const addNote = (flightId: string) => {
    const note = noteInput.trim();
    if (!note) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setFlights((current) =>
      current.map((flight) =>
        flight.id === flightId
          ? {
              ...flight,
              dispatch_notes: flight.dispatch_notes
                ? `${flight.dispatch_notes}\n[${time}] ${note}`
                : `[${time}] ${note}`,
            }
          : flight
      )
    );
    setNoteInput("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0b0c0e] pb-24 md:pb-8">
      <div className="mx-auto max-w-[1540px] px-5 py-6 md:px-8 md:py-8">
        <header className="mb-6 border-b border-white/[0.07] pb-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700">Operations</div>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-zinc-50">Dispatch</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>KPDK</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {mockWeather.flight_category} · {mockWeather.wind_direction}° at {mockWeather.wind_speed} kt
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusCount label="Pre-brief" count={countFor("pre-brief")} state="amber" />
              <StatusCount label="Dispatched" count={countFor("dispatched")} state="neutral" />
              <StatusCount label="Airborne" count={countFor("airborne")} state="blue" />
              <StatusCount label="Closed" count={closedFlights.length} state="green" />
            </div>
          </div>
        </header>

        <div className="grid min-h-[680px] grid-cols-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101114] xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 border-b border-white/[0.07] xl:border-b-0 xl:border-r">
            <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4 md:px-5">
              <div className="text-xs font-medium text-zinc-300">Today&apos;s operations</div>
              <div className="text-[10px] text-zinc-700">{activeFlights.length} active · {closedFlights.length} closed</div>
            </div>

            <div className="hidden grid-cols-[84px_96px_minmax(0,1fr)_120px_100px] gap-3 border-b border-white/[0.055] bg-black/10 px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-700 lg:grid">
              <span>Time</span>
              <span>Status</span>
              <span>Operation</span>
              <span>Aircraft</span>
              <span className="text-right">Fuel</span>
            </div>

            <div className="divide-y divide-white/[0.055]">
              {activeFlights.map((flight) => {
                const selected = flight.id === selectedFlight?.id;
                return (
                  <button
                    key={flight.id}
                    type="button"
                    onClick={() => setSelectedFlightId(flight.id)}
                    className={`grid w-full gap-3 px-4 py-4 text-left transition-colors md:px-5 lg:grid-cols-[84px_96px_minmax(0,1fr)_120px_100px] lg:items-center ${selected ? "bg-white/[0.045]" : "hover:bg-white/[0.022]"}`}
                  >
                    <div>
                      <div className="font-mono text-xs font-medium text-zinc-200">{formatTime(flight.flight_time)}</div>
                      <div className="mt-1 font-mono text-[9px] text-zinc-700">{flight.duration_minutes} min</div>
                    </div>
                    <div>
                      <DispatchBadge status={flight.dispatch_status} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-zinc-200">{flight.customer_name}</div>
                      <div className="mt-1 truncate text-[10px] text-zinc-600">
                        {getServiceTypeLabel(flight.service_type)}
                        {flight.instructor ? ` · ${flight.instructor}` : ""}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-400">{flight.aircraft?.tail_number || "—"}</div>
                    <div className="text-left text-[10px] text-zinc-600 lg:text-right">{flight.fuel_required || "—"}</div>
                  </button>
                );
              })}

              {closedFlights.length > 0 && (
                <div className="border-t border-white/[0.07] bg-black/10 px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-700">
                  Closed operations · {closedFlights.length}
                </div>
              )}
              {closedFlights.map((flight) => (
                <button
                  key={flight.id}
                  type="button"
                  onClick={() => setSelectedFlightId(flight.id)}
                  className="grid w-full gap-3 px-4 py-3.5 text-left opacity-55 transition-colors hover:bg-white/[0.02] md:px-5 lg:grid-cols-[84px_96px_minmax(0,1fr)_120px_100px] lg:items-center"
                >
                  <span className="font-mono text-[11px] text-zinc-500">{formatTime(flight.flight_time)}</span>
                  <DispatchBadge status="closed" />
                  <span className="truncate text-[11px] text-zinc-500">{flight.customer_name}</span>
                  <span className="font-mono text-[10px] text-zinc-600">{flight.aircraft?.tail_number || "—"}</span>
                  <span className="text-left text-[9px] text-zinc-700 lg:text-right">{flight.status === "cancelled" ? "Cancelled" : "Complete"}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="bg-[#0e0f11]">
            {selectedFlight ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/[0.07] px-5 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <DispatchBadge status={selectedFlight.dispatch_status} />
                    <span className="font-mono text-[10px] text-zinc-700">{selectedFlight.id}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold tracking-[-0.02em] text-zinc-100">{selectedFlight.customer_name}</h2>
                      <p className="mt-1 text-[11px] text-zinc-600">{getServiceTypeLabel(selectedFlight.service_type)} · {selectedFlight.duration_minutes} minutes</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-zinc-200">{formatTime(selectedFlight.flight_time)}</div>
                      <div className="mt-1 text-[9px] text-zinc-700">Scheduled</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                  <div>
                    <SectionLabel>Flight assignment</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Fact icon={Plane} label="Aircraft" value={selectedFlight.aircraft?.tail_number || "Unassigned"} />
                      <Fact icon={UserRound} label="Instructor" value={selectedFlight.instructor || "Not required"} />
                      <Fact icon={Fuel} label="Fuel" value={selectedFlight.fuel_required || "Not set"} />
                      <Fact icon={CloudSun} label="Weather" value={mockWeather.flight_category} />
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Release checklist</SectionLabel>
                    <div className="mt-3 divide-y divide-white/[0.055] rounded-lg border border-white/[0.07] bg-black/15 px-3.5">
                      <ChecklistRow label="Weather reviewed" state="ready" />
                      <ChecklistRow label="Aircraft status" state={selectedFlight.aircraft?.status === "maintenance" ? "attention" : "ready"} />
                      <ChecklistRow label="Fuel plan" state={selectedFlight.fuel_required ? "ready" : "attention"} />
                      <ChecklistRow label="Crew / customer assignment" state="ready" />
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Status</SectionLabel>
                    <div className="mt-3 flex items-center gap-1.5">
                      {statusOrder.map((status, index) => {
                        const currentIndex = statusOrder.indexOf(selectedFlight.dispatch_status);
                        const reached = index <= currentIndex;
                        return (
                          <div key={status} className="flex flex-1 items-center gap-1.5">
                            <div className={`h-1.5 flex-1 rounded-full ${reached ? "bg-zinc-400" : "bg-white/[0.07]"}`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex justify-between text-[8px] text-zinc-700">
                      <span>Brief</span><span>Release</span><span>Airborne</span><span>Landed</span><span>Closed</span>
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Dispatch notes</SectionLabel>
                    {selectedFlight.dispatch_notes && (
                      <div className="mt-3 whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/15 px-3.5 py-3 font-mono text-[9px] leading-5 text-zinc-500">
                        {selectedFlight.dispatch_notes}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <input
                        value={noteInput}
                        onChange={(event) => setNoteInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") addNote(selectedFlight.id);
                        }}
                        placeholder="Add an operational note…"
                        className="h-9 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-white/[0.15]"
                      />
                      <button
                        type="button"
                        onClick={() => addNote(selectedFlight.id)}
                        disabled={!noteInput.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-zinc-400 disabled:opacity-25"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.07] p-4">
                  {selectedFlight.dispatch_status !== "closed" && selectedFlight.status !== "cancelled" ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => advanceStatus(selectedFlight.id)}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 text-[11px] font-semibold text-zinc-950 transition-colors hover:bg-white"
                      >
                        {nextActionLabel(selectedFlight.dispatch_status)}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => revertStatus(selectedFlight.id)}
                          disabled={selectedFlight.dispatch_status === "pre-brief"}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] text-[10px] text-zinc-500 transition-colors hover:bg-white/[0.05] disabled:opacity-25"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Revert status
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelFlight(selectedFlight.id)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] text-[10px] text-zinc-600 transition-colors hover:border-rose-400/15 hover:bg-rose-400/[0.04] hover:text-rose-300"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] text-[10px] text-zinc-600">
                      <Check className="h-3.5 w-3.5" />
                      Operation closed
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-xs text-zinc-700">Select an operation to review.</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatusCount({ label, count, state }: { label: string; count: number; state: "amber" | "neutral" | "blue" | "green" }) {
  const dot = state === "amber" ? "bg-amber-300" : state === "blue" ? "bg-sky-400" : state === "green" ? "bg-emerald-400" : "bg-zinc-500";
  return (
    <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 text-[9px] text-zinc-600">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
      <span className="font-mono text-zinc-300">{count}</span>
    </div>
  );
}

function DispatchBadge({ status }: { status: DispatchStatus }) {
  const label = status === "pre-brief" ? "Pre-brief" : status.charAt(0).toUpperCase() + status.slice(1);
  const styles =
    status === "pre-brief"
      ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-300"
      : status === "airborne"
      ? "border-sky-400/20 bg-sky-400/[0.06] text-sky-300"
      : status === "landed"
      ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
      : "border-white/[0.08] bg-white/[0.025] text-zinc-500";
  return <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${styles}`}>{label}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-700">{children}</div>;
}

function Fact({ icon: Icon, label, value }: { icon: typeof Plane; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.065] bg-black/15 p-3">
      <Icon className="h-3.5 w-3.5 text-zinc-600" />
      <div className="mt-3 text-[9px] text-zinc-700">{label}</div>
      <div className="mt-1 truncate text-[11px] text-zinc-300">{value}</div>
    </div>
  );
}

function ChecklistRow({ label, state }: { label: string; state: "ready" | "attention" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className={`flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.08em] ${state === "ready" ? "text-emerald-400" : "text-amber-300"}`}>
        {state === "ready" ? <Check className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
        {state === "ready" ? "Ready" : "Review"}
      </span>
    </div>
  );
}

function nextActionLabel(status: DispatchStatus) {
  if (status === "pre-brief") return "Release flight";
  if (status === "dispatched") return "Mark airborne";
  if (status === "airborne") return "Mark landed";
  if (status === "landed") return "Close operation";
  return "Complete";
}
