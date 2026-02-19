"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Radio,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Plane,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockAircraft } from "@/lib/mock-data";
import { Aircraft } from "@/types";
import { AdsbAircraft } from "@/app/api/adsb/route";

const FlightMap = dynamic(() => import("@/components/flight-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-small text-gray-500">Loading map...</p>
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
  const [fleet, setFleet] = useState<Aircraft[]>(mockAircraft);

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
    } catch {
      // Keep existing data
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 10s
  useEffect(() => {
    fetchAdsb();
    const interval = setInterval(fetchAdsb, 10000);
    return () => clearInterval(interval);
  }, [fetchAdsb]);

  const airborne = adsbData.filter((a) => !a.on_ground);
  const fleetInAir = airborne.filter((a) =>
    fleetIcaos.has(a.icao24.toLowerCase())
  );
  const trafficCount = airborne.length - fleetInAir.length;

  const getFleetAircraft = (icao: string) =>
    fleet.find((a) => a.icao24_hex?.toLowerCase() === icao.toLowerCase());

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-surface-400 bg-surface-100/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Map className="w-4.5 h-4.5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">
              KPDK Flight Tracker
            </h1>
            <p className="text-[11px] text-gray-500">
              DeKalb-Peachtree Airport &bull; Live ADS-B
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Source indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-300 border border-surface-400">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                source === "opensky" ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {source === "opensky" ? "Live" : "Sim"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs text-gray-400">
              <span className="text-cyan-400 font-semibold font-mono">
                {airborne.length}
              </span>{" "}
              airborne
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAdsb}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg bg-surface-300 border border-surface-400 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Map + Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1">
          <FlightMap
            adsbAircraft={adsbData}
            fleet={fleet}
            filter={filter}
            selectedIcao={selectedIcao}
            onSelectAircraft={setSelectedIcao}
          />
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-col border-l border-surface-400 bg-surface-100 overflow-hidden"
              style={{ width: 300 }}
            >
              {/* Filter tabs */}
              <div className="flex border-b border-surface-400">
                {(
                  [
                    { key: "all", label: "All", count: airborne.length },
                    {
                      key: "fleet",
                      label: "My Fleet",
                      count: fleetInAir.length,
                    },
                    {
                      key: "traffic",
                      label: "Traffic",
                      count: trafficCount,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-all border-b-2 ${
                      filter === tab.key
                        ? "text-brand-400 border-brand-400 bg-brand-500/5"
                        : "text-gray-500 border-transparent hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1 text-[10px] px-1 py-0.5 rounded ${
                        filter === tab.key
                          ? "bg-brand-500/20 text-brand-400"
                          : "bg-surface-300 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Aircraft list */}
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
                    // Fleet first, then by altitude desc
                    const aFleet = fleetIcaos.has(a.icao24.toLowerCase())
                      ? 1
                      : 0;
                    const bFleet = fleetIcaos.has(b.icao24.toLowerCase())
                      ? 1
                      : 0;
                    if (aFleet !== bFleet) return bFleet - aFleet;
                    return b.altitude - a.altitude;
                  })
                  .map((ac) => {
                    const isFleet = fleetIcaos.has(ac.icao24.toLowerCase());
                    const fleetAc = isFleet
                      ? getFleetAircraft(ac.icao24)
                      : null;
                    const isSelected = selectedIcao === ac.icao24;

                    return (
                      <button
                        key={ac.icao24}
                        onClick={() =>
                          setSelectedIcao(
                            isSelected ? null : ac.icao24
                          )
                        }
                        className={`w-full text-left px-4 py-3 border-b border-surface-400/50 transition-all ${
                          isSelected
                            ? "bg-brand-500/10 border-l-2 border-l-brand-400"
                            : "hover:bg-surface-200 border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isFleet ? "bg-cyan-400" : "bg-amber-400"
                              }`}
                            />
                            <span className="font-mono text-xs font-semibold text-white">
                              {fleetAc
                                ? fleetAc.tail_number
                                : ac.callsign || ac.icao24.toUpperCase()}
                            </span>
                            {isFleet && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 rounded font-medium">
                                FLEET
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-gray-600">
                            {ac.heading}&deg;
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 ml-4">
                          <span>
                            {fleetAc
                              ? `${fleetAc.make} ${fleetAc.model}`
                              : `ICAO ${ac.icao24.toUpperCase()}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 ml-4">
                          <span className="font-mono text-[10px] text-gray-400">
                            {ac.altitude > 0
                              ? ac.altitude.toLocaleString() + "ft"
                              : "GND"}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            {ac.velocity}kts
                          </span>
                          <span
                            className={`font-mono text-[10px] ${
                              ac.vertical_rate > 200
                                ? "text-emerald-400"
                                : ac.vertical_rate < -200
                                ? "text-rose-400"
                                : "text-gray-500"
                            }`}
                          >
                            {ac.vertical_rate > 0 ? "+" : ""}
                            {ac.vertical_rate}fpm
                          </span>
                        </div>
                      </button>
                    );
                  })}

                {airborne.filter((ac) => {
                  if (ac.on_ground) return false;
                  const isFleet = fleetIcaos.has(ac.icao24.toLowerCase());
                  if (filter === "fleet") return isFleet;
                  if (filter === "traffic") return !isFleet;
                  return true;
                }).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <Plane className="w-8 h-8 text-gray-700 mb-3" />
                    <p className="text-xs text-gray-500">
                      {filter === "fleet"
                        ? "None of your fleet aircraft are airborne"
                        : "No aircraft detected in this filter"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-surface-400 bg-surface-200/50">
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>
                    Updated{" "}
                    {lastUpdate
                      ? lastUpdate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "..."}
                  </span>
                  <span>Auto-refresh 10s</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-surface-300 border border-surface-400 border-r-0 rounded-l-lg items-center justify-center text-gray-500 hover:text-white transition-all"
          style={{ right: panelOpen ? 300 : 0 }}
        >
          {panelOpen ? (
            <ChevronUp className="w-3 h-3 rotate-90" />
          ) : (
            <ChevronDown className="w-3 h-3 rotate-90" />
          )}
        </button>

        {/* Mobile bottom sheet - legend */}
        <div className="md:hidden absolute bottom-4 left-4 right-4 bg-surface-200/95 backdrop-blur-sm border border-surface-400 rounded-xl p-3 z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[10px] text-gray-400">
                  Fleet ({fleetInAir.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-gray-400">
                  Traffic ({trafficCount})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="text-[10px] text-gray-400">KPDK</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  source === "opensky" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span className="text-[9px] text-gray-600 uppercase">
                {source === "opensky" ? "Live" : "Sim"}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(["all", "fleet", "traffic"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all capitalize ${
                  filter === f
                    ? "bg-brand-500/20 text-brand-400"
                    : "bg-surface-300 text-gray-500"
                }`}
              >
                {f === "fleet" ? "My Fleet" : f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
