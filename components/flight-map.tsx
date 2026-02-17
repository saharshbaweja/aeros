"use client";

import { useEffect, useState, useRef } from "react";
import { Aircraft } from "@/types";
import { mockAircraft } from "@/lib/mock-data";

// Simulated aircraft positions around KPDK (DeKalb-Peachtree Airport, Atlanta)
const simulatedPositions: Record<
  string,
  { lat: number; lng: number; heading: number; altitude: number; speed: number }
> = {
  "ac-4": {
    lat: 33.89,
    lng: -84.3,
    heading: 45,
    altitude: 3500,
    speed: 120,
  },
};

// Airport location (KPDK)
const AIRPORT = { lat: 33.8756, lng: -84.3024 };

export default function FlightMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const leafletMap = useRef<L.Map | null>(null);

  const flyingAircraft = mockAircraft.filter((a) => a.status === "flying");

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    let cancelled = false;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([AIRPORT.lat, AIRPORT.lng], 11);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Airport marker
      const airportIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 32px; height: 32px;
          background: rgba(99, 102, 241, 0.25);
          border: 2px solid rgba(99, 102, 241, 0.6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        ">
          <div style="width: 8px; height: 8px; background: #818cf8; border-radius: 50%;"></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([AIRPORT.lat, AIRPORT.lng], { icon: airportIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; color: #fff; background: #1a1a2e; padding: 12px; border-radius: 8px; min-width: 140px;">
            <div style="font-weight: 600; margin-bottom: 4px;">KPDK</div>
            <div style="font-size: 11px; color: #9ca3af;">DeKalb-Peachtree Airport</div>
            <div style="font-size: 11px; color: #9ca3af;">Atlanta, GA</div>
          </div>`,
          {
            className: "dark-popup",
            closeButton: false,
          }
        );

      // Aircraft markers
      flyingAircraft.forEach((aircraft) => {
        const pos = simulatedPositions[aircraft.id];
        if (!pos) return;

        const aircraftIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            position: relative;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="
              position: absolute; inset: 0;
              background: rgba(34, 211, 238, 0.15);
              border-radius: 50%;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 28px; height: 28px;
              background: rgba(34, 211, 238, 0.2);
              border: 2px solid rgba(34, 211, 238, 0.7);
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              transform: rotate(${pos.heading}deg);
              font-size: 14px;
            ">✈</div>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker([pos.lat, pos.lng], { icon: aircraftIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: sans-serif; color: #fff; background: #1a1a2e; padding: 12px; border-radius: 8px; min-width: 160px;">
              <div style="font-weight: 600; margin-bottom: 2px;">${aircraft.tail_number}</div>
              <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">${aircraft.make} ${aircraft.model}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                <div style="color: #6b7280;">Alt</div>
                <div style="color: #22d3ee; text-align: right;">${pos.altitude.toLocaleString()} ft</div>
                <div style="color: #6b7280;">Speed</div>
                <div style="color: #22d3ee; text-align: right;">${pos.speed} kts</div>
                <div style="color: #6b7280;">Heading</div>
                <div style="color: #22d3ee; text-align: right;">${pos.heading}°</div>
              </div>
            </div>`,
            {
              className: "dark-popup",
              closeButton: false,
            }
          );
      });

      // Add custom CSS for popups
      const style = document.createElement("style");
      style.textContent = `
        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 8px !important;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .dark-popup .leaflet-popup-tip {
          background: #1a1a2e !important;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-container {
          background: #0a0a0f !important;
        }
      `;
      document.head.appendChild(style);

      leafletMap.current = map;
      setMapLoaded(true);
    };

    loadMap();

    return () => {
      cancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute top-4 left-4 bg-surface-200/90 backdrop-blur-sm border border-surface-400 rounded-xl p-4 z-[1000]">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Live Tracking
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-xs text-gray-300">
              In Flight ({flyingAircraft.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-400" />
            <span className="text-xs text-gray-300">Airport (KPDK)</span>
          </div>
        </div>

        {flyingAircraft.length > 0 && (
          <div className="mt-3 pt-3 border-t border-surface-400 space-y-2">
            {flyingAircraft.map((ac) => {
              const pos = simulatedPositions[ac.id];
              return (
                <div key={ac.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400">
                    {ac.tail_number}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {ac.make} {ac.model}
                  </span>
                  {pos && (
                    <span className="text-[10px] text-gray-600 ml-auto">
                      {pos.altitude.toLocaleString()}ft
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {flyingAircraft.length === 0 && (
          <p className="mt-2 text-[10px] text-gray-600">
            No aircraft currently in flight
          </p>
        )}
      </div>
    </div>
  );
}
