"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  CloudSun,
  FileText,
  Plane,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type {
  AerosOperationalAnalysis,
  FlightContext,
  OperationalOption,
  SourceRef,
} from "@/types/flight-context";

interface IntelligenceResponse {
  context?: FlightContext;
  analysis?: AerosOperationalAnalysis | null;
  mode?: string;
  warning?: string;
}

type DisplayOption = {
  id: string;
  title: string;
  status: OperationalOption["status"];
  description: string;
  timing: string;
  operationalImpact: string;
  constraints: string[];
  confidence: number;
  evidenceCount: number;
};

const fallbackOptions: DisplayOption[] = [
  {
    id: "delay",
    title: "Delay departure 42 minutes",
    status: "RECOMMENDED",
    description: "Keep N731GT on the mission and move arrival into the stronger forecast window.",
    timing: "+42 min",
    operationalImpact: "Preserves aircraft assignment · shifts 1 downstream reservation",
    constraints: ["Confirm customer acceptance", "Recheck KCHA weather before release"],
    confidence: 86,
    evidenceCount: 4,
  },
  {
    id: "alternate",
    title: "Depart on time with KRMG alternate",
    status: "VIABLE",
    description: "Preserve departure time with additional fuel and alternate planning requirements.",
    timing: "On time",
    operationalImpact: "+31 min block allowance · +8.7 gal planning impact",
    constraints: ["Confirm fuel quantity", "Review alternate minima"],
    confidence: 74,
    evidenceCount: 5,
  },
  {
    id: "swap",
    title: "Swap to N442SP",
    status: "BLOCKED",
    description: "A second aircraft could protect the schedule, but qualification context is incomplete.",
    timing: "On time",
    operationalImpact: "Could preserve downstream schedule",
    constraints: ["Pilot qualification not verified"],
    confidence: 42,
    evidenceCount: 2,
  },
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
    void loadIntelligence();
  }, []);

  const context = payload?.context;
  const analysis = payload?.analysis;
  const risk = analysis?.overallRisk || "AMBER";
  const departureMetar = context?.weather?.departure?.metar;
  const destinationMetar = context?.weather?.destination?.metar;
  const updatedAt = context?.updatedAt
    ? new Date(context.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const options = useMemo<DisplayOption[]>(() => {
    if (!analysis?.options?.length) return fallbackOptions;

    return analysis.options.slice(0, 4).map((option) => ({
      id: option.id,
      title: option.title,
      status: option.status,
      description: option.description,
      timing:
        option.delayMinutes == null
          ? "—"
          : option.delayMinutes === 0
          ? "On time"
          : `${option.delayMinutes > 0 ? "+" : ""}${option.delayMinutes} min`,
      operationalImpact: [
        option.fuelImpactGallons != null
          ? `${option.fuelImpactGallons >= 0 ? "+" : ""}${option.fuelImpactGallons} gal fuel`
          : null,
        option.blockers.length
          ? `${option.blockers.length} blocker${option.blockers.length === 1 ? "" : "s"}`
          : "No known blocker",
      ]
        .filter(Boolean)
        .join(" · "),
      constraints: option.blockers.length ? option.blockers : option.requirements.slice(0, 2),
      confidence: Math.round(option.confidence * 100),
      evidenceCount: option.evidence.length,
    }));
  }, [analysis]);

  const evidence = useMemo<SourceRef[]>(() => {
    const refs: SourceRef[] = [];
    const seen = new Set<string>();

    const add = (source?: SourceRef) => {
      if (!source) return;
      const key = `${source.provider}:${source.product}:${source.identifier || source.url || source.raw || ""}`;
      if (seen.has(key)) return;
      seen.add(key);
      refs.push(source);
    };

    add(departureMetar?.source);
    add(destinationMetar?.source);
    context?.weather?.alternates.forEach((airport) => add(airport.metar?.source));
    analysis?.findings.forEach((finding) => finding.evidence.forEach(add));
    analysis?.options.forEach((option) => option.evidence.forEach(add));

    return refs.slice(0, 6);
  }, [analysis, context, departureMetar, destinationMetar]);

  const missingInputs = analysis?.unansweredQuestions?.length
    ? analysis.unansweredQuestions.slice(0, 4)
    : [
        "Operator-specific policy source is not connected.",
        "Crew duty and qualification state has not been verified.",
        "Current MEL / maintenance limitations are not connected.",
      ];

  const liveState = loading
    ? "Updating"
    : payload?.mode === "live"
    ? "Live synthesis"
    : payload
    ? "Partial context"
    : "Degraded";

  return (
    <div className="h-full overflow-y-auto bg-[#0b0c0e] pb-24 md:pb-10">
      <div className="mx-auto max-w-[1540px] px-5 py-6 md:px-8 md:py-8">
        <header className="mb-7 border-b border-white/[0.07] pb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span>Operations</span>
              <ChevronRight className="h-3 w-3 text-zinc-700" />
              <span className="text-zinc-300">Mission 142</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${payload ? "bg-emerald-400" : "bg-amber-400"}`} />
                {liveState}
              </span>
              <span className="hidden sm:inline">Updated {updatedAt}</span>
              <button
                type="button"
                onClick={() => void loadIntelligence()}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-zinc-400 transition-colors hover:bg-white/[0.055] hover:text-zinc-200"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-[-0.035em] text-zinc-50 md:text-[32px]">
                  KPDK <span className="text-zinc-700">→</span> KCHA
                </h1>
                <RiskBadge risk={risk} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="font-mono text-zinc-400">AEROS-DEMO-142</span>
                <span>N731GT · C172</span>
                <span>Alternate KRMG</span>
                <span>Departure in ~90 min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dispatch"
                className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]"
              >
                Open dispatch
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101114]">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="p-5 md:p-6">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-300/80">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Material change
                  </div>
                  <h2 className="max-w-4xl text-lg font-medium leading-7 tracking-[-0.015em] text-zinc-100 md:text-xl">
                    {analysis?.executiveSummary ||
                      "Destination weather is trending toward a lower-margin arrival window. Aeros has evaluated the current mission and the most practical recovery paths."}
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">
                    {(analysis?.changes?.length
                      ? analysis.changes.slice(0, 3)
                      : ["KCHA arrival margin reduced", "Alternate strategy now material", "Downstream booking may shift"]
                    ).map((change) => (
                      <span key={change} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        {change}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.07] bg-black/15 p-5 lg:border-l lg:border-t-0">
                  <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Current context</div>
                  <div className="space-y-3.5">
                    <ContextRow
                      icon={CloudSun}
                      label="KPDK weather"
                      value={departureMetar?.flightCategory || "Connected"}
                      detail={departureMetar?.raw || "Live weather context"}
                    />
                    <ContextRow
                      icon={CloudSun}
                      label="KCHA weather"
                      value={destinationMetar?.flightCategory || "Connected"}
                      detail={destinationMetar?.raw || "Live weather context"}
                    />
                    <ContextRow icon={Plane} label="Aircraft" value="Partial" detail="N731GT · maintenance feed pending" />
                    <ContextRow icon={ShieldCheck} label="Operator rules" value="Missing" detail="Policy source not connected" />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101114]">
              <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Operational options</h2>
                  <p className="mt-1 text-[11px] text-zinc-600">Compared against timing, disruption, blockers, evidence and confidence.</p>
                </div>
                <span className="text-[10px] text-zinc-600">{options.length} paths evaluated</span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {options.map((option) => (
                  <OptionRow key={option.id} option={option} />
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-[#101114] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Evidence</h3>
                    <p className="mt-1 text-[11px] text-zinc-600">Sources supporting this decision brief.</p>
                  </div>
                  <FileText className="h-4 w-4 text-zinc-600" />
                </div>
                {evidence.length ? (
                  <div className="divide-y divide-white/[0.055]">
                    {evidence.map((source, index) => (
                      <SourceRow key={`${source.provider}-${source.product}-${index}`} source={source} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-5 text-xs text-zinc-600">
                    Live weather is loading. Additional evidence will appear here as sources resolve.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#101114] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Open questions</h3>
                    <p className="mt-1 text-[11px] text-zinc-600">Missing context Aeros will not silently assume.</p>
                  </div>
                  <TriangleAlert className="h-4 w-4 text-amber-300/70" />
                </div>
                <div className="space-y-2.5">
                  {missingInputs.map((item) => (
                    <div key={item} className="flex gap-3 rounded-lg border border-white/[0.06] bg-black/15 px-3.5 py-3">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-300/70" />
                      <span className="text-xs leading-5 text-zinc-400">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/settings" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 hover:text-white">
                  Connect missing context <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>
          </main>

          <aside className="space-y-5">
            <section className="rounded-xl border border-white/[0.08] bg-[#101114] p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">Mission brief</h3>
                <p className="mt-1 text-[11px] text-zinc-600">What Aeros currently knows.</p>
              </div>
              <div className="divide-y divide-white/[0.055]">
                <BriefRow label="Route" value="KPDK → KCHA" />
                <BriefRow label="Aircraft" value="N731GT · C172" />
                <BriefRow label="Alternate" value="KRMG" />
                <BriefRow label="Departure" value="~90 min" />
                <BriefRow label="Risk" value={risk} emphasized />
                <BriefRow label="Synthesis" value={liveState} />
              </div>
            </section>

            <section className="rounded-xl border border-white/[0.08] bg-[#101114] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Readiness</h3>
                  <p className="mt-1 text-[11px] text-zinc-600">Coverage before an operator commits.</p>
                </div>
                <Wrench className="h-4 w-4 text-zinc-600" />
              </div>
              <div className="space-y-3">
                <ReadinessRow label="Weather" state="verified" />
                <ReadinessRow label="Flight plan" state="verified" />
                <ReadinessRow label="Aircraft status" state="partial" />
                <ReadinessRow label="Crew qualification" state="missing" />
                <ReadinessRow label="Operator policy" state="missing" />
              </div>
            </section>

            <section className="rounded-xl border border-white/[0.08] bg-[#101114] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-100">Decision authority</h3>
              </div>
              <p className="text-xs leading-5 text-zinc-500">
                Aeros provides decision support and preserves the evidence behind each option. Operational authority remains with the operator, PIC, dispatcher and maintenance personnel where applicable.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function OptionRow({ option }: { option: DisplayOption }) {
  const blocked = option.status === "BLOCKED";
  const recommended = option.status === "RECOMMENDED";

  return (
    <div className={`grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.55fr)_110px_minmax(180px,.75fr)_110px_120px] lg:items-center ${recommended ? "bg-white/[0.025]" : ""}`}>
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={option.status} />
          <h3 className="text-sm font-medium text-zinc-100">{option.title}</h3>
        </div>
        <p className="max-w-2xl text-[11px] leading-5 text-zinc-500">{option.description}</p>
      </div>

      <div>
        <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-700 lg:hidden">Timing</div>
        <div className="mt-1 font-mono text-xs text-zinc-300 lg:mt-0">{option.timing}</div>
      </div>

      <div>
        <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-700 lg:hidden">Impact / constraints</div>
        <div className="mt-1 text-[11px] leading-5 text-zinc-500 lg:mt-0">{option.operationalImpact}</div>
        {option.constraints.length > 0 && (
          <div className="mt-1.5 text-[10px] leading-4 text-zinc-600">{option.constraints.slice(0, 2).join(" · ")}</div>
        )}
      </div>

      <div>
        <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-700 lg:hidden">Confidence</div>
        <div className="mt-1 text-xs text-zinc-300 lg:mt-0">{option.confidence}%</div>
        <div className="mt-1 text-[9px] text-zinc-700">{option.evidenceCount} source{option.evidenceCount === 1 ? "" : "s"}</div>
      </div>

      <div className="flex lg:justify-end">
        {blocked ? (
          <span className="text-[10px] text-zinc-700">Resolve blocker</span>
        ) : (
          <Link
            href="/dispatch"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-medium transition-colors ${recommended ? "bg-zinc-100 text-zinc-950 hover:bg-white" : "border border-white/[0.09] bg-white/[0.025] text-zinc-300 hover:bg-white/[0.06]"}`}
          >
            Review
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const styles =
    risk === "RED"
      ? "border-rose-400/20 bg-rose-400/[0.07] text-rose-300"
      : risk === "GREEN"
      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
      : "border-amber-400/20 bg-amber-400/[0.07] text-amber-300";

  return <span className={`rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${styles}`}>{risk} review</span>;
}

function StatusBadge({ status }: { status: DisplayOption["status"] }) {
  const styles =
    status === "RECOMMENDED"
      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
      : status === "BLOCKED"
      ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
      : status === "CONDITIONAL"
      ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-300"
      : "border-white/[0.09] bg-white/[0.025] text-zinc-400";

  return <span className={`rounded-md border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${styles}`}>{status}</span>;
}

function ContextRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-none text-zinc-600" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-500">{label}</span>
          <span className="font-mono text-[9px] text-zinc-400">{value}</span>
        </div>
        <div className="mt-1 truncate text-[9px] text-zinc-700" title={detail}>{detail}</div>
      </div>
    </div>
  );
}

function SourceRow({ source }: { source: SourceRef }) {
  const time = source.observedAt || source.validFrom;
  const timestamp = time
    ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Current";

  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-white/[0.07] bg-black/20">
        <FileText className="h-3 w-3 text-zinc-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] text-zinc-300">{source.product}</div>
        <div className="mt-0.5 truncate text-[9px] text-zinc-700">{source.provider}{source.identifier ? ` · ${source.identifier}` : ""}</div>
      </div>
      <span className="font-mono text-[9px] text-zinc-700">{timestamp}</span>
    </div>
  );
}

function BriefRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-[11px] text-zinc-600">{label}</span>
      <span className={`text-right text-[11px] ${emphasized ? "font-medium text-amber-300" : "text-zinc-300"}`}>{value}</span>
    </div>
  );
}

function ReadinessRow({ label, state }: { label: string; state: "verified" | "partial" | "missing" }) {
  const verified = state === "verified";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <span className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.08em] ${verified ? "text-emerald-400" : state === "partial" ? "text-amber-300" : "text-zinc-700"}`}>
        {verified ? <Check className="h-3 w-3" /> : <span className="h-1 w-1 rounded-full bg-current" />}
        {state}
      </span>
    </div>
  );
}
