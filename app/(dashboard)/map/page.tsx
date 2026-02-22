"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, RefreshCw, ChevronUp, ChevronDown, Plane } from "lucide-react";
import { mockAircraft } from "@/lib/mock-data";
import { Aircraft } from "@/types";
import { AdsbAircraft } from "@/app/api/adsb/route";

const FlightMap = dynamic(() => import("@/components/flight-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-small text-slate-400">Loading map...</p>
      </div>
    </div>
  ),
});

type FilterMode = "all" | "fleet" | "traffic";

export default function MapPage() {
  const [adsbData, setAdsbData] = useState<AdsbAircraft[]>([]);
  const [source, setSource] = useState<string>("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fleet] = useState<Aircraft[]>(mockAircraft);

  const fleetIcaos = new Set(
    fleet.filter((a) => a.icao24_hex).map((a) => a.icao24_hex!.toLowerCase())
  );

  const fetchAdsb = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/adsb");
      const data = await res.json();
      setAdsbData(data.aircraft || []);
      setSource(data.source || "unknown");
      setLastUpdate(new Date());
    } catch { /* keep existing */ } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdsb();
    const interval = setInterval(fetchAdsb, 10000);
    return () => clearInterval(interval);
  }, [fetchAdsb]);

  const airborne = adsbData.filter((a) => !a.on_ground);
  const fleetInAir = airborne.filter((a) => fleetIcaos.has(a.icao24.toLowerCase()));
  const trafficCount = airborne.length - fleetInAir.length;
  const getFleetAircraft = (icao: string) => fleet.find((a) => a.icao24_hex?.toLowerCase() === icao.toLowerCase());

  const sourceLabel = source === "flightrackerpro" ? "FTP" : source === "opensky" ? "Live" : "Sim";
  const sourceColor = source === "simulated" ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Floating controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200">
          <Radio className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
          <span className="text-xs text-slate-600">
            <span className="text-brand-500 font-semibold font-mono">{airborne.length}</span> airborne
          </span>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <div className={`w-1.5 h-1.5 rounded-full ${sourceColor}`} />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{sourceLabel}</span>
        </div>
        <button
          onClick={fetchAdsb}
          disabled={refreshing}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-500 transition-all disabled:opacity-50 shadow-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex flex-col absolute right-0 top-0 bottom-0 w-[300px] bg-white/95 backdrop-blur-md border-l border-slate-200 overflow-hidden z-20 shadow-xl"
          >
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">KPDK Flight Tracker</h2>
              <p className="text-[11px] text-slate-400">DeKalb-Peachtree Airport</p>
            </div>

            <div className="flex border-b border-slate-200">
              {([
                { key: "all", label: "All", count: airborne.length },
                { key: "fleet", label: "My Fleet", count: fleetInAir.length },
                { key: "traffic", label: "Traffic", count: trafficCount },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-all border-b-2 ${
                    filter === tab.key
                      ? "text-brand-500 border-brand-500 bg-brand-50/50"
                      : "text-slate-400 border-transparent hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1 text-[10px] px-1 py-0.5 rounded ${filter === tab.key ? "bg-brand-50 text-brand-500" : "bg-slate-100 text-slate-400"}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {airborne
                .filter((ac) => {
                  if (ac.on_ground) return false;
                  const isFleet = fleetIcaos.has(ac.icao24.toLowerCase());
                  if (filter === "fleet") return isFleet;
                  if (filter === "traffic") return !isFleet;
                  return true;
                })
                .sort((a, b) => {
                  const aF = fleetIcaos.has(a.icao24.toLowerCase()) ? 1 : 0;
                  const bF = fleetIcaos.has(b.icao24.toLowerCase()) ? 1 : 0;
                  if (aF !== bF) return bF - aF;
                  return b.altitude - a.altitude;
                })
                .map((ac) => {
                  const isFleet = fleetIcaos.has(ac.icao24.toLowerCase());
                  const fleetAc = isFleet ? getFleetAircraft(ac.icao24) : null;
                  const isSelected = selectedIcao === ac.icao24;
                  return (
                    <button
                      key={ac.icao24}
                      onClick={() => setSelectedIcao(isSelected ? null : ac.icao24)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-all ${isSelected ? "bg-brand-50 border-l-2 border-l-brand-500" : "hover:bg-slate-50 border-l-2 border-l-transparent"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isFleet ? "bg-brand-500" : "bg-amber-400"}`} />
                          <span className="font-mono text-xs font-semibold text-slate-700">{fleetAc ? fleetAc.tail_number : ac.callsign || ac.icao24.toUpperCase()}</span>
                          {isFleet && <span className="text-[9px] px-1.5 py-0.5 bg-brand-50 text-brand-500 rounded font-medium border border-brand-200">FLEET</span>}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{ac.heading}&deg;</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 ml-4">
                        <span>{fleetAc ? `${fleetAc.make} ${fleetAc.model}` : `ICAO ${ac.icao24.toUpperCase()}`}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 ml-4">
                        <span className="font-mono text-[10px] text-slate-500">{ac.altitude > 0 ? ac.altitude.toLocaleString() + "ft" : "GND"}</span>
                        <span className="font-mono text-[10px] text-slate-500">{ac.velocity}kts</span>
                        <span className={`font-mono text-[10px] ${ac.vertical_rate > 200 ? "text-emerald-500" : ac.vertical_rate < -200 ? "text-rose-500" : "text-slate-400"}`}>{ac.vertical_rate > 0 ? "+" : ""}{ac.vertical_rate}fpm</span>
                      </div>
                    </button>
                  );
                })}
              {airborne.filter((ac) => { if (ac.on_ground) return false; const isFleet = fleetIcaos.has(ac.icao24.toLowerCase()); if (filter === "fleet") return isFleet; if (filter === "traffic") return !isFleet; return true; }).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Plane className="w-8 h-8 text-slate-200 mb-3" />
                  <p className="text-xs text-slate-400">{filter === "fleet" ? "None of your fleet aircraft are airborne" : "No aircraft detected in this filter"}</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Updated {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "..."}</span>
                <span>Auto-refresh 10s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-white border border-slate-200 border-r-0 rounded-l-lg items-center justify-center text-slate-400 hover:text-brand-500 transition-all shadow-md"
        style={{ right: panelOpen ? 300 : 0 }}
      >
        {panelOpen ? <ChevronUp className="w-3 h-3 rotate-90" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
      </button>

      <div className="md:hidden absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 z-[1000] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="text-[10px] text-slate-500">Fleet ({fleetInAir.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] text-slate-500">Traffic ({trafficCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${sourceColor}`} />
            <span className="text-[9px] text-slate-400 uppercase">{sourceLabel}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(["all", "fleet", "traffic"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all capitalize ${filter === f ? "bg-brand-50 text-brand-500 border border-brand-200" : "bg-slate-100 text-slate-400"}`}>
              {f === "fleet" ? "My Fleet" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <FlightMap adsbAircraft={adsbData} fleet={fleet} filter={filter} selectedIcao={selectedIcao} onSelectAircraft={setSelectedIcao} />
      </div>
    </div>
  );
}
