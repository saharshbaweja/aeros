"use client";

import { motion } from "framer-motion";
import { Wind, Eye, Thermometer, ArrowUp } from "lucide-react";
import { WeatherData } from "@/types";
import { Badge } from "@/components/ui/badge";

interface WeatherCardProps {
  weather: WeatherData;
}

const categoryColors = {
  VFR: "success",
  MVFR: "default",
  IFR: "warning",
  LIFR: "danger",
} as const;

export default function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-200">Weather</h3>
          <Badge variant={categoryColors[weather.flight_category]}>
            {weather.flight_category}
          </Badge>
        </div>
        <span className="text-xs font-mono text-zinc-500">{weather.station}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-xs">Wind</span>
          </div>
          <p className="text-body text-zinc-200 font-medium font-mono">
            {weather.wind_speed}kts
            {weather.wind_gust ? ` G${weather.wind_gust}` : ""}
          </p>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <ArrowUp
              className="w-3 h-3"
              style={{ transform: `rotate(${weather.wind_direction}deg)` }}
            />
            {weather.wind_direction}&deg;
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs">Visibility</span>
          </div>
          <p className="text-body text-zinc-200 font-medium font-mono">
            {weather.visibility}SM
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <Thermometer className="w-3.5 h-3.5" />
            <span className="text-xs">Temp / Dew</span>
          </div>
          <p className="text-body text-zinc-200 font-medium font-mono">
            {weather.temperature}&deg; / {weather.dewpoint}&deg;
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="text-xs">Ceiling</span>
          </div>
          <p className="text-body text-zinc-200 font-medium font-mono">
            {weather.ceiling ? `${weather.ceiling.toLocaleString()}ft` : "CLR"}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2">
        <p className="text-xs font-mono text-zinc-500 break-all">
          {weather.raw_metar}
        </p>
      </div>
    </motion.div>
  );
}
