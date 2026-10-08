"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Database,
  GitBranch,
  Layers3,
  Network,
  Plane,
  Radar,
  Route,
  Satellite,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

const productSections = [
  { id: "command", label: "Command center" },
  { id: "graph", label: "Operational graph" },
  { id: "recovery", label: "Recovery" },
  { id: "agents", label: "Agent mesh" },
  { id: "action", label: "System of action" },
];

const inputs = [
  ["Schedule", "Pilotbase / FSP", Database],
  ["Weather", "METAR · TAF · hazards", CloudRain],
  ["Aeronautical", "FAA · airports · procedures", Route],
  ["Aircraft", "status · maintenance · limits", Plane],
  ["People", "crew · students · qualifications", ShieldCheck],
  ["Telemetry", "ADS-B · avionics · FDM", Satellite],
];

export default function MarketingPage() {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#070708] text-zinc-100 overflow-x-hidden selection:bg-brand-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-280px] left-1/2 -translate-x-1/2 w-[1050px] h-[700px] rounded-full bg-brand-500/[0.08] blur-[150px]" />
        <div className="absolute top-[900px] right-[-300px] w-[700px] h-[700px] rounded-full bg-cyan-400/[0.035] blur-[140px]" />
      </div>

      <motion.header
        animate={{ width: scrolling ? "min(760px, calc(100% - 32px))" : "min(1040px, calc(100% - 32px))", y: scrolling ? 10 : 18 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50"
      >
        <div className={`h-14 rounded-2xl border border-white/[0.09] bg-[#0d0d0f]/80 backdrop-blur-2xl shadow-2xl shadow-black/30 px-3 flex items-center ${scrolling ? "justify-between" : "justify-between"}`}>
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-[-0.03em]">Aeros</span>
          </Link>
          {!scrolling && (
            <nav className="hidden lg:flex items-center gap-1">
              {productSections.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="px-3 py-2 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {!scrolling && <Link href="/login" className="hidden sm:block px-3 py-2 text-[11px] text-zinc-500 hover:text-zinc-200">Sign in</Link>}
            <Link href="/dashboard" className="h-9 px-3.5 rounded-xl bg-white text-black text-[11px] font-semibold flex items-center gap-1.5 hover:bg-zinc-200 transition-colors">
              Open Aeros <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.header>

      <section className="relative max-w-[1220px] mx-auto px-5 pt-44 md:pt-52 pb-24 md:pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          The intelligence layer for aviation operations
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="text-[clamp(3.4rem,8vw,7.4rem)] leading-[0.92] font-semibold tracking-[-0.065em] text-white max-w-6xl mx-auto">
          Aeros understands the operation. Then changes it.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="max-w-3xl mx-auto mt-8 text-base md:text-xl leading-8 text-zinc-500 tracking-[-0.015em]">
          Connect schedules, weather, aircraft, pilots, maintenance, training, FAA data and operator policy. Aeros maintains a live model of every mission, detects what changed, simulates the downstream impact, and builds the best recovery plan.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
          <Link href="/dashboard" className="h-12 px-5 rounded-2xl bg-white text-black text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors">
            Explore the product <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#command" className="h-12 px-5 rounded-2xl border border-white/[0.09] bg-white/[0.035] text-sm text-zinc-300 flex items-center gap-2 hover:bg-white/[0.07] transition-colors">
            See how it works <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        <HeroConsole />
      </section>

      <section className="relative border-y border-white/[0.06] bg-white/[0.012]">
        <div className="max-w-[1220px] mx-auto px-5 py-14 md:py-16">
          <div className="grid md:grid-cols-[.8fr_1.2fr] gap-8 md:gap-16 items-start">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">One operating picture</div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.045em] mt-3 max-w-md">Aviation data stops living in separate tabs.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {inputs.map(([title, detail, Icon]) => (
                <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <Icon className="w-4 h-4 text-zinc-500" />
                  <div className="text-xs text-zinc-200 mt-4">{String(title)}</div>
                  <div className="text-[10px] text-zinc-600 mt-1">{String(detail)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductChapter
        id="command"
        eyebrow="01 · Command center"
        title="See the operation as a living system."
        body="Aeros does not make you hunt through weather, schedules, aircraft status and policy. Every mission is continuously scored against the context that can change its outcome."
        bullets={["Mission health instead of static alerts", "Only material changes surface", "Evidence and freshness attached to every conclusion"]}
        visual={<CommandVisual />}
      />

      <ProductChapter
        id="graph"
        eyebrow="02 · Operational graph"
        title="Everything that matters is connected."
        body="The core of Aeros is a temporal graph of missions, aircraft, people, airports, procedures, weather, maintenance, reservations and training. When one node changes, Aeros understands the downstream chain."
        bullets={["Every fact is time-aware and source-backed", "Replay exactly what Aeros knew at any moment", "The same graph powers dispatch, training, safety and recovery"]}
        visual={<GraphVisual />}
        reverse
      />

      <ProductChapter
        id="recovery"
        eyebrow="03 · Counterfactual recovery"
        title="Do not just explain the problem. Rebuild the plan."
        body="Aeros tests alternatives across the whole operation: delay, swap aircraft, change route, reassign crew, move a lesson or protect the downstream schedule. Each option carries blockers, tradeoffs and expected impact."
        bullets={["Simulate what-if changes before committing", "Rank options against safety, feasibility and disruption", "Protect downstream missions—not only the flight in front of you"]}
        visual={<RecoveryVisual />}
      />

      <ProductChapter
        id="agents"
        eyebrow="04 · Agent mesh"
        title="Specialists reason over one shared truth."
        body="Weather, airspace, aircraft, crew, training, maintenance, scheduling and safety intelligence publish typed claims into a shared mission state. The system coordinates expertise without letting agents invent context for each other."
        bullets={["Agents exchange structured claims, not chat", "Deterministic checks sit beside model reasoning", "A verifier can challenge high-impact conclusions"]}
        visual={<AgentVisual />}
        reverse
      />

      <ProductChapter
        id="action"
        eyebrow="05 · System of action"
        title="Intelligence becomes workflow."
        body="The end state is not another briefing screen. Aeros proposes the recovery, routes the required approval, executes the permitted changes and keeps monitoring what happens next."
        bullets={["Human approval at authority boundaries", "Every action tied back to evidence and decision", "Existing systems remain connected while Aeros becomes the operating layer"]}
        visual={<ActionVisual />}
      />

      <section className="relative max-w-[1220px] mx-auto px-5 py-24 md:py-32">
        <div className="rounded-[32px] border border-white/[0.07] bg-white/[0.025] overflow-hidden">
          <div className="p-7 md:p-10 border-b border-white/[0.06] grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Integration fabric</div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.05em] mt-3">Start above the stack. Absorb it over time.</h2>
            </div>
            <p className="text-sm leading-6 text-zinc-500 max-w-xl lg:ml-auto">Aeros can begin as the intelligence layer above tools an operator already uses. As decisions and workflows move into Aeros, the platform gradually becomes the system of action—and eventually the system of record.</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5">
            {["AviationWeather.gov", "Pilotbase / FSP", "FAA NASR + CIFP", "FAA NOTAM", "ADS-B + avionics"].map((item, index) => (
              <div key={item} className="p-5 md:p-6 border-b md:border-b-0 md:border-r last:border-r-0 border-white/[0.06]">
                <div className={`w-2 h-2 rounded-full ${index < 2 ? "bg-emerald-400" : "bg-zinc-700"}`} />
                <div className="text-xs text-zinc-300 mt-5">{item}</div>
                <div className="text-[10px] text-zinc-600 mt-1.5">{index === 0 ? "Live" : index === 1 ? "Adapter ready" : "Roadmap"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative max-w-[1220px] mx-auto px-5 pb-28 md:pb-36">
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-12 lg:gap-20">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">The wedge → the platform</div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.05em] mt-3">Start with disruption recovery. Expand into the operation.</h2>
            <p className="text-sm leading-7 text-zinc-500 mt-5">The first magical workflow is simple to understand: something changes, Aeros finds every affected dependency, builds recovery options and helps execute the best one. The same model expands naturally into dispatch, scheduling, training, safety, maintenance and fleet planning.</p>
          </div>
          <div className="space-y-2">
            {["Disruption recovery", "Dispatch intelligence", "Schedule optimization", "Training + crew planning", "Safety + maintenance", "Aviation operating system"].map((item, index) => (
              <div key={item} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-black/30 flex items-center justify-center text-[10px] font-mono text-zinc-600">0{index + 1}</div>
                <div className="text-sm text-zinc-300">{item}</div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 ml-auto group-hover:text-brand-300 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.06]">
        <div className="max-w-[1220px] mx-auto px-5 py-28 md:py-36 text-center">
          <Sparkles className="w-5 h-5 text-brand-300 mx-auto" />
          <h2 className="text-4xl md:text-7xl font-semibold tracking-[-0.06em] mt-6 max-w-4xl mx-auto">Aeros should know what changed before you have to ask.</h2>
          <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto mt-6 leading-7">And when it matters, it should already have the recovery plan ready.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-white text-black text-sm font-semibold mt-8 hover:bg-zinc-200 transition-colors">Open the command center <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-[1220px] mx-auto px-5 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-zinc-500" /><span className="text-xs font-semibold text-zinc-400">Aeros</span></div>
          <div className="text-[10px] text-zinc-700">Operational intelligence for aviation.</div>
        </div>
      </footer>
    </main>
  );
}

function ProductChapter({ id, eyebrow, title, body, bullets, visual, reverse = false }: { id: string; eyebrow: string; title: string; body: string; bullets: string[]; visual: React.ReactNode; reverse?: boolean }) {
  return (
    <section id={id} className="relative max-w-[1220px] mx-auto px-5 py-24 md:py-36 scroll-mt-24">
      <div className={`grid lg:grid-cols-2 gap-10 lg:gap-20 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-120px" }}>
          <div className="text-[10px] uppercase tracking-[0.2em] text-brand-300/70">{eyebrow}</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.02] font-semibold tracking-[-0.055em] mt-4 text-white">{title}</h2>
          <p className="text-sm md:text-base leading-7 text-zinc-500 mt-6 max-w-xl">{body}</p>
          <div className="space-y-3 mt-7">
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-2.5 text-xs text-zinc-400"><CheckCircle2 className="w-3.5 h-3.5 text-brand-300 mt-0.5 flex-shrink-0" />{bullet}</div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.06 }}>
          {visual}
        </motion.div>
      </div>
    </section>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[28px] border border-white/[0.08] bg-[#0c0c0f] shadow-[0_40px_120px_rgba(0,0,0,.45)] overflow-hidden">{children}</div>;
}

function HeroConsole() {
  return (
    <motion.div initial={{ opacity: 0, y: 34, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-16 md:mt-20 text-left max-w-6xl mx-auto">
      <Frame>
        <div className="h-12 px-4 border-b border-white/[0.06] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" /><div className="text-[10px] text-zinc-600 font-mono ml-3">AEROS / MISSION 142</div><div className="ml-auto text-[9px] text-emerald-400 uppercase tracking-wider">live</div></div>
        <div className="grid lg:grid-cols-[1fr_320px] min-h-[470px]">
          <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
            <div className="flex items-center justify-between gap-4"><div><div className="text-[10px] text-zinc-600 uppercase tracking-[0.17em]">Material change</div><div className="text-lg md:text-2xl font-semibold tracking-[-0.03em] mt-2">Destination weather changed. Four dependencies recomputed.</div></div><div className="px-2.5 py-1 rounded-full border border-amber-400/20 bg-amber-400/[0.07] text-[9px] text-amber-300">AMBER</div></div>
            <div className="grid md:grid-cols-4 gap-2 mt-6">{["Weather", "Fuel", "Schedule", "Training"].map((x, i) => <div key={x} className="rounded-xl border border-white/[0.06] bg-black/25 p-3"><div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-amber-400" : "bg-zinc-700"}`} /><div className="text-[10px] text-zinc-400 mt-4">{x}</div><div className="text-[9px] text-zinc-700 mt-1">recomputed</div></div>)}</div>
            <div className="mt-6"><div className="text-[10px] text-zinc-600 uppercase tracking-[0.17em] mb-3">Recovery options</div><div className="grid md:grid-cols-3 gap-2"><MiniOption title="Delay 42 min" status="recommended" /><MiniOption title="Use KRMG" status="viable" /><MiniOption title="Swap N442SP" status="blocked" /></div></div>
          </div>
          <div className="p-5 md:p-6 bg-white/[0.012]"><div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-brand-300" /><span className="text-xs font-semibold text-zinc-300">Aeros context</span></div><div className="space-y-3 mt-5">{[["KPDK", "METAR current"], ["KCHA", "TAF changed"], ["N731GT", "aircraft ready"], ["Crew", "available"], ["Policy", "2 rules applied"]].map(([a,b]) => <div key={a} className="flex items-center justify-between border-b border-white/[0.05] pb-3"><div className="text-[10px] text-zinc-500">{a}</div><div className="text-[9px] text-zinc-700">{b}</div></div>)}</div><div className="rounded-2xl border border-brand-400/15 bg-brand-500/[0.06] p-4 mt-6"><div className="text-[9px] uppercase tracking-[0.16em] text-brand-300">Ask Aeros</div><div className="text-xs text-zinc-300 mt-2">What if we leave 45 minutes later?</div><div className="text-[10px] leading-5 text-zinc-600 mt-2">Recompute the mission, downstream reservations and crew margin.</div></div></div>
        </div>
      </Frame>
    </motion.div>
  );
}

function MiniOption({ title, status }: { title: string; status: string }) {
  return <div className={`rounded-xl border p-3 ${status === "recommended" ? "border-brand-400/25 bg-brand-500/[0.08]" : "border-white/[0.06] bg-black/20"}`}><div className={`text-[8px] uppercase tracking-wider ${status === "recommended" ? "text-brand-300" : status === "blocked" ? "text-rose-300" : "text-zinc-600"}`}>{status}</div><div className="text-[11px] text-zinc-300 mt-2">{title}</div></div>;
}

function CommandVisual() {
  return <Frame><div className="p-5 border-b border-white/[0.06] flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /><span className="text-xs text-zinc-300">Mission health</span><span className="text-[9px] text-zinc-700 ml-auto">12 monitored · 2 need review</span></div><div className="p-4 space-y-2">{[["142", "KPDK → KCHA", "AT RISK"], ["145", "KPDK → KAHN", "READY"], ["151", "LOCAL TRAINING", "READY"], ["154", "KPDK → KRYY", "MONITOR"]].map(([id,route,state], i) => <div key={id} className="rounded-xl border border-white/[0.055] bg-white/[0.018] p-4 flex items-center gap-4"><div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-amber-400" : i === 3 ? "bg-sky-400" : "bg-emerald-400"}`} /><div><div className="text-[11px] text-zinc-300">Mission {id}</div><div className="text-[9px] text-zinc-600 mt-1">{route}</div></div><div className="ml-auto text-[8px] text-zinc-600 tracking-wider">{state}</div></div>)}</div></Frame>;
}

function GraphVisual() {
  const nodes = [["Weather", "KCHA TAF"], ["Mission", "142"], ["Aircraft", "N731GT"], ["Training", "Lesson 7"], ["Schedule", "16:30"], ["Maintenance", "100hr"]];
  return <Frame><div className="p-5 border-b border-white/[0.06] flex items-center gap-2"><Network className="w-4 h-4 text-brand-300" /><span className="text-xs text-zinc-300">Operational graph</span></div><div className="p-7 relative min-h-[390px] grid grid-cols-2 md:grid-cols-3 gap-4 content-center">{nodes.map(([label,value], index) => <motion.div key={label} animate={{ y: [0, index % 2 ? -3 : 3, 0] }} transition={{ duration: 4 + index * .3, repeat: Infinity }} className={`rounded-2xl border p-4 ${index === 1 ? "border-brand-400/30 bg-brand-500/[0.09]" : "border-white/[0.06] bg-black/25"}`}><div className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">{label}</div><div className="text-xs text-zinc-300 mt-2">{value}</div><div className="text-[9px] text-zinc-700 mt-4">{index + 2} relationships</div></motion.div>)}</div></Frame>;
}

function RecoveryVisual() {
  return <Frame><div className="p-5 border-b border-white/[0.06] flex items-center gap-2"><GitBranch className="w-4 h-4 text-brand-300" /><span className="text-xs text-zinc-300">Counterfactual engine</span></div><div className="p-5 space-y-3"><div className="rounded-2xl border border-brand-400/25 bg-brand-500/[0.07] p-5"><div className="flex items-center justify-between"><div className="text-[9px] uppercase tracking-wider text-brand-300">Recommended</div><CheckCircle2 className="w-4 h-4 text-brand-300" /></div><div className="text-lg text-white mt-3">Delay 42 minutes</div><div className="grid grid-cols-3 gap-2 mt-5">{[["Cancellations","0"],["Downstream","+22m"],["Crew","valid"]].map(([a,b]) => <div key={a} className="rounded-xl bg-black/20 border border-white/[0.05] p-3"><div className="text-[8px] text-zinc-700">{a}</div><div className="text-xs text-zinc-300 mt-1">{b}</div></div>)}</div></div>{["Swap to N442SP", "Use KRMG alternate"].map((x,i)=><div key={x} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 flex items-center"><div><div className="text-xs text-zinc-300">{x}</div><div className="text-[9px] text-zinc-700 mt-1">{i ? "viable · +31m block" : "blocked · qualification"}</div></div><ChevronRight className="w-3.5 h-3.5 text-zinc-700 ml-auto" /></div>)}</div></Frame>;
}

function AgentVisual() {
  const agents = [["Weather",CloudRain],["Airspace",Radar],["Aircraft",Plane],["Maintenance",Wrench],["Crew",ShieldCheck],["Recovery",GitBranch]] as const;
  return <Frame><div className="p-5 border-b border-white/[0.06] flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-brand-300" /><span className="text-xs text-zinc-300">Agent mesh</span><span className="ml-auto text-[9px] text-emerald-400">shared state healthy</span></div><div className="p-6"><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{agents.map(([name,Icon],i)=><div key={name} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4"><Icon className="w-4 h-4 text-zinc-500" /><div className="text-[11px] text-zinc-300 mt-4">{name}</div><div className="flex items-center gap-1.5 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-[8px] text-zinc-700">{i + 2} claims</span></div></div>)}</div><div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 flex items-center gap-3"><Network className="w-4 h-4 text-brand-300" /><div><div className="text-[10px] text-zinc-300">Shared mission blackboard</div><div className="text-[9px] text-zinc-700 mt-1">facts · evidence · dependencies · confidence</div></div></div></div></Frame>;
}

function ActionVisual() {
  const steps = [["Detect", "TAF changes"],["Decide", "Delay 42 min"],["Approve", "Ops manager"],["Execute", "Shift reservation"],["Observe", "Keep monitoring"]];
  return <Frame><div className="p-5 border-b border-white/[0.06] flex items-center gap-2"><Zap className="w-4 h-4 text-brand-300" /><span className="text-xs text-zinc-300">Decision → action</span></div><div className="p-6 space-y-2">{steps.map(([a,b],i)=><div key={a} className="flex items-center gap-3"><div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${i < 3 ? "border-brand-400/20 bg-brand-500/[0.07] text-brand-300" : "border-white/[0.06] bg-black/20 text-zinc-700"}`}><span className="text-[9px] font-mono">0{i+1}</span></div><div className="flex-1 rounded-xl border border-white/[0.05] bg-black/20 p-3"><div className="text-[9px] text-zinc-600">{a}</div><div className="text-[11px] text-zinc-300 mt-1">{b}</div></div></div>)}</div></Frame>;
}
