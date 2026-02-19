import { NextResponse } from "next/server";

// KPDK - DeKalb-Peachtree Airport, Atlanta GA
const PDK_LAT = 33.8756;
const PDK_LNG = -84.3024;
const RADIUS_DEG = 0.5; // ~30nm bounding box

export interface AdsbAircraft {
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number; // feet
  velocity: number; // knots
  heading: number;
  vertical_rate: number; // ft/min
  on_ground: boolean;
  last_contact: number;
}

export async function GET() {
  try {
    // OpenSky Network API - free, no auth needed for basic use
    // Bounding box around PDK
    const lamin = PDK_LAT - RADIUS_DEG;
    const lamax = PDK_LAT + RADIUS_DEG;
    const lomin = PDK_LNG - RADIUS_DEG;
    const lomax = PDK_LNG + RADIUS_DEG;

    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

    const res = await fetch(url, {
      next: { revalidate: 10 }, // cache for 10 seconds
    });

    if (!res.ok) {
      // If OpenSky is down or rate-limited, return simulated data
      return NextResponse.json({
        aircraft: getSimulatedTraffic(),
        source: "simulated",
        airport: { lat: PDK_LAT, lng: PDK_LNG, code: "KPDK", name: "DeKalb-Peachtree Airport" },
        timestamp: Date.now(),
      });
    }

    const data = await res.json();
    const aircraft: AdsbAircraft[] = [];

    if (data.states) {
      for (const state of data.states) {
        // OpenSky state vector indices:
        // 0=icao24, 1=callsign, 2=origin_country, 3=time_position, 4=last_contact,
        // 5=longitude, 6=latitude, 7=baro_altitude, 8=on_ground, 9=velocity,
        // 10=true_track, 11=vertical_rate, 12=sensors, 13=geo_altitude
        const lat = state[6];
        const lng = state[5];
        const alt = state[7] ?? state[13];
        const vel = state[9];
        const hdg = state[10];

        if (lat == null || lng == null) continue;

        aircraft.push({
          icao24: state[0]?.trim() ?? "",
          callsign: state[1]?.trim() ?? "",
          latitude: lat,
          longitude: lng,
          altitude: alt != null ? Math.round(alt * 3.28084) : 0, // meters to feet
          velocity: vel != null ? Math.round(vel * 1.94384) : 0, // m/s to knots
          heading: hdg != null ? Math.round(hdg) : 0,
          vertical_rate: state[11] != null ? Math.round(state[11] * 196.85) : 0, // m/s to ft/min
          on_ground: state[8] ?? false,
          last_contact: state[4] ?? 0,
        });
      }
    }

    return NextResponse.json({
      aircraft,
      source: "opensky",
      airport: { lat: PDK_LAT, lng: PDK_LNG, code: "KPDK", name: "DeKalb-Peachtree Airport" },
      timestamp: Date.now(),
    });
  } catch {
    // Fallback to simulated data
    return NextResponse.json({
      aircraft: getSimulatedTraffic(),
      source: "simulated",
      airport: { lat: PDK_LAT, lng: PDK_LNG, code: "KPDK", name: "DeKalb-Peachtree Airport" },
      timestamp: Date.now(),
    });
  }
}

function getSimulatedTraffic(): AdsbAircraft[] {
  // Realistic simulated traffic around PDK when OpenSky is unavailable
  const now = Date.now() / 1000;
  const t = (now % 360) * (Math.PI / 180);

  return [
    {
      icao24: "a13579",
      callsign: "N13579",
      latitude: PDK_LAT + 0.015 + Math.sin(t) * 0.02,
      longitude: PDK_LNG + 0.02 + Math.cos(t) * 0.025,
      altitude: 3500,
      velocity: 120,
      heading: Math.round((Math.atan2(Math.cos(t), -Math.sin(t)) * 180) / Math.PI + 360) % 360,
      vertical_rate: 0,
      on_ground: false,
      last_contact: now,
    },
    {
      icao24: "a8f3b2",
      callsign: "N442SP",
      latitude: PDK_LAT - 0.05 + Math.cos(t * 0.7) * 0.03,
      longitude: PDK_LNG + 0.06 + Math.sin(t * 0.7) * 0.04,
      altitude: 5200,
      velocity: 145,
      heading: Math.round((Math.atan2(Math.sin(t * 0.7), Math.cos(t * 0.7)) * 180) / Math.PI + 360) % 360,
      vertical_rate: 200,
      on_ground: false,
      last_contact: now,
    },
    {
      icao24: "a4e921",
      callsign: "N789GA",
      latitude: PDK_LAT + 0.08 + Math.sin(t * 0.5 + 1) * 0.04,
      longitude: PDK_LNG - 0.03 + Math.cos(t * 0.5 + 1) * 0.05,
      altitude: 2800,
      velocity: 95,
      heading: Math.round((Math.atan2(Math.cos(t * 0.5 + 1), -Math.sin(t * 0.5 + 1)) * 180) / Math.PI + 360) % 360,
      vertical_rate: -300,
      on_ground: false,
      last_contact: now,
    },
    {
      icao24: "a12345",
      callsign: "N12345",
      latitude: PDK_LAT + 0.04 + Math.sin(t * 0.3 + 2) * 0.06,
      longitude: PDK_LNG + 0.05 + Math.cos(t * 0.3 + 2) * 0.03,
      altitude: 4100,
      velocity: 110,
      heading: Math.round((Math.atan2(Math.cos(t * 0.3 + 2), Math.sin(t * 0.3 + 2)) * 180) / Math.PI + 360) % 360,
      vertical_rate: 100,
      on_ground: false,
      last_contact: now,
    },
    {
      icao24: "ac7d44",
      callsign: "EJA524",
      latitude: PDK_LAT - 0.12 + Math.cos(t * 0.4 + 3) * 0.08,
      longitude: PDK_LNG - 0.08 + Math.sin(t * 0.4 + 3) * 0.06,
      altitude: 8500,
      velocity: 250,
      heading: Math.round((Math.atan2(Math.sin(t * 0.4 + 3), Math.cos(t * 0.4 + 3)) * 180) / Math.PI + 360) % 360,
      vertical_rate: 1500,
      on_ground: false,
      last_contact: now,
    },
    {
      icao24: "a67890",
      callsign: "N67890",
      latitude: PDK_LAT - 0.02 + Math.sin(t * 0.6 + 4) * 0.015,
      longitude: PDK_LNG - 0.01 + Math.cos(t * 0.6 + 4) * 0.02,
      altitude: 1800,
      velocity: 80,
      heading: Math.round((Math.atan2(Math.cos(t * 0.6 + 4), -Math.sin(t * 0.6 + 4)) * 180) / Math.PI + 360) % 360,
      vertical_rate: -500,
      on_ground: false,
      last_contact: now,
    },
  ];
}
