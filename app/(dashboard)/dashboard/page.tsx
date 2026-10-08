"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  GitBranch,
  Network,
  Plane,
  Radar,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { AerosOperationalAnalysis, FlightContext } from "@/types/flight-context";

interface IntelligenceResponse {
  context?: FlightContext;
  analysis?: AerosOperationalAnalysis | null;
  mode?: string;
  warning?: string;
}

const fallbackOptions = [
  {
    id: "delay",
    title: "Delay 42 minutes",
    status: "RECOMMENDED",
    description: "Preserve the aircraft assignment while moving the mission into the stronger forecast window.",
    impact: "0 cancellations · 1 downstream shift",
  },
  {
    id: "alternate",
    title: "Use KRMG alternate",
    status: "VIABLE",
    description: "Maintain departure time with additional fuel and alternate planning requirements.",
    impact: "+31 min block time · +8.7 gal",
  },
  {
    id: "swap",
    title: "Swap to N442SP",
    status: "BLOCKED",
    description: "Aircraft is available, but current training/qualification context prevents automatic assignment.",
    impact: "1 qualification blocker",
  },
];

const systemAgents = [
  { label: "Weather", icon: CloudRain, state: "live" },
  { label: "Flight", icon: Route, state: "live" },
  { label: "Airworthiness", icon: Wrench, state: "context" },
  { label: "Policy", icon: ShieldCheck, state: "context" },
  { label: "Recovery", icon: GitBranch, state: "active" },
];

export default function IntelligenceDashboardPage() {
  const [payload, setPayload] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: "AEROS-DEMO-142",
          departure: "KPDK",
          destination: "KCHA",
          alternates: ["KRMG"],
          plannedDeparture: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
          aircraft: { tailNumber: "N731GT", type: "C172" },
        }),
      });

      if (!response.ok) throw new Error("intelligence request failed");
      setPayload(await response.json());
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
  }, []);

  const risk = payload?.analysis?.overallRisk || "AMBER";
  const destinationMetar = payload?.context?.weather?.destination?.metar;
  const departureMetar = payload?.context?.weather?.departure?.metar;
  const options = useMemo(() => {
    if (!payload?.analysis?.options?.length) return fallbackOptions;
    return payload.analysis.options.slice(0, 3).map((option) => ({
      id: option.id,
      title: option.title,
      status: option.status,
      description: option.description,
      impact: [
        option.delayMinutes != null ? `${option.delayMinutes >= 0 ? "+" : ""}${option.delayMinutes} min` : null,
        option.fuelImpactGallons != null ? `${option.fuelImpactGallons >= 0 ? "+" : ""}${option.fuelImpactGallons} gal` : null,
        option.blockers.length ? `${option.blockers.length} blocker${option.blockers.length === 1 ? "" : "s"}` : null,
      ].filter(Boolean).join(" · ") || "Operationally evaluated",
    }));
  }, [payload]);

  return (
    <div className="h-screen overflow-y-auto pb-24 md:pb-8">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational intelligence · continuously monitoring
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-white">Mission control</h1>
            <p className="text-sm md:text-base text-zinc-500 mt-2 max-w-2xl">
              Aeros continuously resolves weather, aircraft, crew, policy, training and schedule context into the next best operational action.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadIntelligence}
              className="h-10 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-zinc-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Recompute
            </button>
            <Link href="/dispatch" className="h-10 px-4 rounded-xl bg-white text-black text-xs font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors">
              Open operation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)] gap-4">
          <div className="space-y-4">
            <section className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-400/20 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-brand-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">Mission 142 · KPDK → KCHA</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">N731GT · C172 · DEP +90m</div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold tracking-wide ${risk === "RED" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : risk === "GREEN" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}>
                  {risk} · ACTIVE REVIEW
                </div>
              </div>

              <div className="p-5 md:p-6 grid lg:grid-cols-[1.15fr_.85fr] gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 mb-3">Material change detected</div>
                  <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.03em] text-white max-w-xl">
                    {payload?.analysis?.executiveSummary || "Destination weather is trending toward a lower-margin arrival window. Aeros is recomputing the mission and downstream schedule."}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2 mt-5">
                    {["Destination suitability", "Alternate strategy", "Fuel requirement", "Downstream reservation"].map((item, index) => (
                      <div key={item} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 flex items-start gap-2.5">
                        {index === 0 ? <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5" /> : <Activity className="w-4 h-4 text-zinc-500 mt-0.5" />}
                        <div>
                          <div className="text-xs text-zinc-300">{item}</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5">Dependency recomputed</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold text-zinc-300">Live mission context</div>
                    <Radar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <Metric label="KPDK" value={departureMetar?.flightCategory || "LIVE"} detail={departureMetar?.raw || "METAR connected"} />
                    <Metric label="KCHA" value={destinationMetar?.flightCategory || "LIVE"} detail={destinationMetar?.raw || "TAF + METAR connected"} />
                    <Metric label="Aircraft" value="READY" detail="N731GT · maintenance context pending integration" />
                    <Metric label="Policy" value="PARTIAL" detail="Operator rules not yet connected" />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Recovery engine</div>
                  <h3 className="text-lg font-semibold text-white mt-1">Best paths forward</h3>
                </div>
                <Sparkles className="w-4 h-4 text-brand-300" />
              </div>
              <div className="grid lg:grid-cols-3 gap-3">
                {options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={`rounded-2xl border p-4 ${option.status === "RECOMMENDED" ? "border-brand-400/30 bg-brand-500/[0.09]" : option.status === "BLOCKED" ? "border-rose-400/15 bg-rose-400/[0.04]" : "border-white/[0.07] bg-black/20"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-semibold tracking-wide ${option.status === "RECOMMENDED" ? "text-brand-300" : option.status === "BLOCKED" ? "text-rose-300" : "text-zinc-500"}`}>{option.status}</span>
                      {option.status === "RECOMMENDED" && <CheckCircle2 className="w-3.5 h-3.5 text-brand-300" />}
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 mt-3">{option.title}</div>
                    <div className="text-xs leading-5 text-zinc-500 mt-2 min-h-[60px]">{option.description}</div>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-zinc-500 font-mono">{option.impact}</div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-4 h-4 text-brand-300" />
                <h3 className="text-sm font-semibold text-zinc-200">Operational dependency graph</h3>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[760px] flex items-center justify-between gap-2 py-4">
                  {[
                    ["WEATHER", "KCHA TAF"],
                    ["MISSION", "142"],
                    ["FUEL", "reserve"],
                    ["SCHEDULE", "next booking"],
                    ["TRAINING", "qualification"],
                    ["RECOVERY", "3 options"],
                  ].map(([label, value], index, arr) => (
                    <div key={label} className="contents">
                      <div className="w-[108px] rounded-xl border border-white/[0.07] bg-black/25 p-3 text-center">
                        <div className="text-[9px] tracking-[0.14em] text-zinc-600">{label}</div>
                        <div className="text-xs text-zinc-300 mt-1.5">{value}</div>
                      </div>
                      {index < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Agent mesh</div>
                  <div className="text-sm font-semibold text-zinc-200 mt-1">Shared operational state</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                {systemAgents.map(({ label, icon: Icon, state }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs text-zinc-300">{label}</span>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider ${state === "live" || state === "active" ? "text-emerald-400" : "text-zinc-600"}`}>{state}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-gradient-to-b from-brand-500/[0.08] to-transparent p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-brand-300/80">Ask Aeros</div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mt-2">Query the operation, not a chatbot.</h3>
              <p className="text-xs leading-5 text-zinc-500 mt-2">Questions run against the same mission state, evidence and constraints driving recovery.</p>
              <div className="mt-4 space-y-2">
                {["What changes if we leave 45 minutes later?", "Can another aircraft preserve the schedule?", "Which downstream missions are exposed?"].map((question) => (
                  <Link key={question} href={`/dashboard?q=${encodeURIComponent(question)}`} className="block rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors">
                    {question}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 mb-3">System truth</div>
              <div className="space-y-3 text-xs">
                <StatusRow label="Aviation weather" state="connected" />
                <StatusRow label="ADS-B / live traffic" state="connected" />
                <StatusRow label="Pilotbase / FSP" state="configure" />
                <StatusRow label="FAA NOTAM" state="onboarding" />
                <StatusRow label="Operator policies" state="pending" />
              </div>
              <Link href="/settings" className="mt-4 flex items-center gap-1.5 text-[11px] text-brand-300 hover:text-brand-200">Manage integrations <ArrowRight className="w-3 h-3" /></Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
      <div>
        <div className="text-[10px] text-zinc-600">{label}</div>
        <div className="text-[10px] text-zinc-600 mt-1 line-clamp-2 max-w-[220px]">{detail}</div>
      </div>
      <div className="text-[10px] font-mono text-zinc-300">{value}</div>
    </div>
  );
}

function StatusRow({ label, state }: { label: string; state: string }) {
  const connected = state === "connected";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-[9px] uppercase tracking-wider ${connected ? "text-emerald-400" : state === "configure" ? "text-brand-300" : "text-zinc-600"}`}>{state}</span>
    </div>
  );
}
