"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Aircraft } from "@/types";
import type { AdsbAircraft } from "@/app/api/adsb/route";
import type L from "leaflet";

interface FlightMapProps {
  adsbAircraft: AdsbAircraft[];
  fleet: Aircraft[];
  filter: "all" | "fleet" | "traffic";
  selectedIcao: string | null;
  onSelectAircraft: (icao: string | null) => void;
}

const AIRPORT = { lat: 33.8756, lng: -84.3024 };

export default function FlightMap({
  adsbAircraft,
  fleet,
  filter,
  selectedIcao,
  onSelectAircraft,
}: FlightMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const initRef = useRef(false);

  const fleetIcaos = new Set(
    fleet.filter((a) => a.icao24_hex).map((a) => a.icao24_hex!.toLowerCase())
  );

  const getFleetAircraft = useCallback(
    (icao: string) => fleet.find((a) => a.icao24_hex?.toLowerCase() === icao.toLowerCase()),
    [fleet]
  );

  useEffect(() => {
    if (!mapRef.current || initRef.current) return;
    initRef.current = true;
    let cancelled = false;

    const loadMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;
      leafletRef.current = Leaflet;

      const map = Leaflet.map(mapRef.current, {
        zoomControl: false,
      }).setView([AIRPORT.lat, AIRPORT.lng], 11);

      Leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      const airportIcon = Leaflet.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 44px; height: 44px;
          background: rgba(27, 73, 101, 0.1);
          border: 2px solid rgba(27, 73, 101, 0.4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(27, 73, 101, 0.15);
        ">
          <div style="width: 14px; height: 14px; background: #1B4965; border-radius: 50%; box-shadow: 0 0 8px rgba(27, 73, 101, 0.4);"></div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      Leaflet.marker([AIRPORT.lat, AIRPORT.lng], { icon: airportIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: Inter, system-ui, sans-serif; color: #1e293b; background: #fff; padding: 14px 16px; border-radius: 12px; min-width: 180px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px; color: #1B4965;">KPDK</div>
            <div style="font-size: 12px; color: #64748b;">DeKalb-Peachtree Airport</div>
            <div style="font-size: 12px; color: #94a3b8;">Atlanta, Georgia</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Elev: 1,003ft &bull; Rwy 3L/21R, 3R/21L
            </div>
          </div>`,
          { className: "aeros-popup", closeButton: false }
        );

      const rwy3L21R = [[33.8696, -84.3078], [33.8838, -84.2978]] as L.LatLngTuple[];
      const rwy3R21L = [[33.8718, -84.3068], [33.8822, -84.2993]] as L.LatLngTuple[];

      Leaflet.polyline(rwy3L21R, { color: "#1B4965", weight: 2, opacity: 0.35, dashArray: "6 4" }).addTo(map);
      Leaflet.polyline(rwy3R21L, { color: "#1B4965", weight: 2, opacity: 0.35, dashArray: "6 4" }).addTo(map);

      const markerGroup = Leaflet.layerGroup().addTo(map);
      markersRef.current = markerGroup;
      leafletMap.current = map;

      const style = document.createElement("style");
      style.textContent = `
        .aeros-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .aeros-popup .leaflet-popup-content { margin: 0 !important; }
        .aeros-popup .leaflet-popup-tip { background: #fff !important; }
        @keyframes acPing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    };

    loadMap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const Leaflet = leafletRef.current;
    const markers = markersRef.current;
    if (!Leaflet || !markers) return;
    markers.clearLayers();

    const visible = adsbAircraft.filter((ac) => {
      if (ac.on_ground) return false;
      if (filter === "fleet") return fleetIcaos.has(ac.icao24.toLowerCase());
      if (filter === "traffic") return !fleetIcaos.has(ac.icao24.toLowerCase());
      return true;
    });

    visible.forEach((ac) => {
      const isFleet = fleetIcaos.has(ac.icao24.toLowerCase());
      const isSelected = selectedIcao === ac.icao24;
      const fleetAc = isFleet ? getFleetAircraft(ac.icao24) : null;
      const color = isFleet ? "#1B4965" : "#D97706";
      const colorRgb = isFleet ? "27, 73, 101" : "217, 119, 6";
      const size = isSelected ? 48 : 36;

      const icon = Leaflet.divIcon({
        className: "custom-marker",
        html: `<div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${isSelected ? `<div style="position: absolute; inset: 0; border: 2px solid ${color}; border-radius: 50%; animation: acPing 1.5s ease-out infinite;"></div>` : ""}
          <div style="position: absolute; inset: ${isSelected ? 4 : 2}px; background: rgba(${colorRgb}, 0.12); border-radius: 50%;"></div>
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" style="transform: rotate(${ac.heading}deg); filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));">
            <path d="M12 2L8 10H3L5 13H8L7 22H9L12 16L15 22H17L16 13H19L21 10H16L12 2Z" fill="${color}" stroke="${color}" stroke-width="0.5"/>
          </svg>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const displayName = fleetAc ? fleetAc.tail_number : ac.callsign || ac.icao24.toUpperCase();
      const subtitle = fleetAc ? `${fleetAc.make} ${fleetAc.model}` : "ADS-B Target";
      const badge = isFleet
        ? `<span style="display: inline-block; padding: 2px 8px; background: #EFF6FF; color: #1B4965; border-radius: 6px; font-size: 10px; font-weight: 600; margin-left: 6px; border: 1px solid #BFDBFE;">MY FLEET</span>`
        : "";
      const vRateArrow = ac.vertical_rate > 200 ? " &#9650;" : ac.vertical_rate < -200 ? " &#9660;" : "";
      const vRateColor = ac.vertical_rate > 200 ? "#059669" : ac.vertical_rate < -200 ? "#E11D48" : "#94a3b8";

      const popup = `<div style="font-family: Inter, system-ui, sans-serif; color: #1e293b; background: #fff; padding: 14px 16px; border-radius: 12px; min-width: 200px; border: 1px solid ${isFleet ? "#BFDBFE" : "#e2e8f0"}; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 700; font-size: 14px; color: #1B4965;">${displayName}</span>
          ${badge}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">${subtitle}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
          <div style="color: #94a3b8;">Altitude</div>
          <div style="color: #334155; text-align: right; font-family: 'JetBrains Mono', monospace;">${ac.altitude > 0 ? ac.altitude.toLocaleString() + " ft" : "GND"}</div>
          <div style="color: #94a3b8;">Speed</div>
          <div style="color: #334155; text-align: right; font-family: 'JetBrains Mono', monospace;">${ac.velocity} kts</div>
          <div style="color: #94a3b8;">Heading</div>
          <div style="color: #334155; text-align: right; font-family: 'JetBrains Mono', monospace;">${ac.heading}&deg;</div>
          <div style="color: #94a3b8;">V/S</div>
          <div style="color: ${vRateColor}; text-align: right; font-family: 'JetBrains Mono', monospace;">${ac.vertical_rate > 0 ? "+" : ""}${ac.vertical_rate} fpm${vRateArrow}</div>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">
          ICAO: ${ac.icao24.toUpperCase()} &bull; ${ac.callsign ? "CS: " + ac.callsign : "No callsign"}
        </div>
      </div>`;

      const marker = Leaflet.marker([ac.latitude, ac.longitude], { icon })
        .bindPopup(popup, { className: "aeros-popup", closeButton: false });
      marker.on("click", () => { onSelectAircraft(ac.icao24); });
      markers.addLayer(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adsbAircraft, filter, selectedIcao]);

  useEffect(() => {
    if (!selectedIcao || !leafletMap.current) return;
    const ac = adsbAircraft.find((a) => a.icao24 === selectedIcao);
    if (ac) {
      leafletMap.current.setView([ac.latitude, ac.longitude], 13, { animate: true, duration: 0.5 });
    }
  }, [selectedIcao, adsbAircraft]);

  return <div ref={mapRef} className="w-full h-full" />;
}
