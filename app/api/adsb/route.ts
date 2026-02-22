import { NextResponse } from "next/server";

const PDK_LAT = 33.8756;
const PDK_LNG = -84.3024;
const RADIUS_DEG = 0.5;

export interface AdsbAircraft {
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  vertical_rate: number;
  on_ground: boolean;
  last_contact: number;
  source?: string;
}

export async function GET() {
  const ftpKey = process.env.FLIGHTRACKER_PRO_API_KEY;

  // Try Flight Tracker Pro API first
  if (ftpKey) {
    try {
      const aircraft = await fetchFlightTrackerPro(ftpKey);
      if (aircraft.length > 0) {
        return NextResponse.json({
          aircraft,
          source: "flightrackerpro",
          airport: { lat: PDK_LAT, lng: PDK_LNG, code: "KPDK", name: "DeKalb-Peachtree Airport" },
          timestamp: Date.now(),
        });
      }
    } catch {
      // Fall through to OpenSky
    }
  }

  // Try OpenSky Network
  try {
    const lamin = PDK_LAT - RADIUS_DEG;
    const lamax = PDK_LAT + RADIUS_DEG;
    const lomin = PDK_LNG - RADIUS_DEG;
    const lomax = PDK_LNG + RADIUS_DEG;

    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const res = await fetch(url, { next: { revalidate: 10 } });

    if (!res.ok) {
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
          altitude: alt != null ? Math.round(alt * 3.28084) : 0,
          velocity: vel != null ? Math.round(vel * 1.94384) : 0,
          heading: hdg != null ? Math.round(hdg) : 0,
          vertical_rate: state[11] != null ? Math.round(state[11] * 196.85) : 0,
          on_ground: state[8] ?? false,
          last_contact: state[4] ?? 0,
          source: "opensky",
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
    return NextResponse.json({
      aircraft: getSimulatedTraffic(),
      source: "simulated",
      airport: { lat: PDK_LAT, lng: PDK_LNG, code: "KPDK", name: "DeKalb-Peachtree Airport" },
      timestamp: Date.now(),
    });
  }
}

async function fetchFlightTrackerPro(apiKey: string): Promise<AdsbAircraft[]> {
  const lamin = PDK_LAT - RADIUS_DEG;
  const lamax = PDK_LAT + RADIUS_DEG;
  const lomin = PDK_LNG - RADIUS_DEG;
  const lomax = PDK_LNG + RADIUS_DEG;

  const res = await fetch(
    `https://api.flighttrackerpro.com/v1/aircraft?lat=${PDK_LAT}&lon=${PDK_LNG}&radius=50&api_key=${apiKey}`,
    { next: { revalidate: 5 } }
  );

  if (!res.ok) throw new Error("FTP API error");

  const data = await res.json();
  const aircraft: AdsbAircraft[] = [];

  if (data.aircraft || data.ac) {
    const acList = data.aircraft || data.ac || [];
    for (const ac of acList) {
      const lat = ac.lat ?? ac.latitude;
      const lng = ac.lon ?? ac.lng ?? ac.longitude;
      if (lat == null || lng == null) continue;
      if (lat < lamin || lat > lamax || lng < lomin || lng > lomax) continue;

      aircraft.push({
        icao24: (ac.icao ?? ac.hex ?? ac.icao24 ?? "").toLowerCase().trim(),
        callsign: (ac.flight ?? ac.callsign ?? ac.call ?? "").trim(),
        latitude: lat,
        longitude: lng,
        altitude: ac.alt_baro ?? ac.altitude ?? ac.alt ?? 0,
        velocity: ac.gs ?? ac.speed ?? ac.velocity ?? 0,
        heading: ac.track ?? ac.heading ?? ac.hdg ?? 0,
        vertical_rate: ac.baro_rate ?? ac.vertical_rate ?? ac.vs ?? 0,
        on_ground: ac.on_ground ?? ac.ground ?? (ac.alt_baro === "ground" ? true : false),
        last_contact: ac.seen ?? ac.last_contact ?? Date.now() / 1000,
        source: "flightrackerpro",
      });
    }
  }

  return aircraft;
}

function getSimulatedTraffic(): AdsbAircraft[] {
  const now = Date.now() / 1000;
  const t = (now % 360) * (Math.PI / 180);

  return [
    { icao24: "a13579", callsign: "N13579", latitude: PDK_LAT + 0.015 + Math.sin(t) * 0.02, longitude: PDK_LNG + 0.02 + Math.cos(t) * 0.025, altitude: 3500, velocity: 120, heading: Math.round((Math.atan2(Math.cos(t), -Math.sin(t)) * 180) / Math.PI + 360) % 360, vertical_rate: 0, on_ground: false, last_contact: now },
    { icao24: "a8f3b2", callsign: "N442SP", latitude: PDK_LAT - 0.05 + Math.cos(t * 0.7) * 0.03, longitude: PDK_LNG + 0.06 + Math.sin(t * 0.7) * 0.04, altitude: 5200, velocity: 145, heading: Math.round((Math.atan2(Math.sin(t * 0.7), Math.cos(t * 0.7)) * 180) / Math.PI + 360) % 360, vertical_rate: 200, on_ground: false, last_contact: now },
    { icao24: "a4e921", callsign: "N789GA", latitude: PDK_LAT + 0.08 + Math.sin(t * 0.5 + 1) * 0.04, longitude: PDK_LNG - 0.03 + Math.cos(t * 0.5 + 1) * 0.05, altitude: 2800, velocity: 95, heading: Math.round((Math.atan2(Math.cos(t * 0.5 + 1), -Math.sin(t * 0.5 + 1)) * 180) / Math.PI + 360) % 360, vertical_rate: -300, on_ground: false, last_contact: now },
    { icao24: "a12345", callsign: "N12345", latitude: PDK_LAT + 0.04 + Math.sin(t * 0.3 + 2) * 0.06, longitude: PDK_LNG + 0.05 + Math.cos(t * 0.3 + 2) * 0.03, altitude: 4100, velocity: 110, heading: Math.round((Math.atan2(Math.cos(t * 0.3 + 2), Math.sin(t * 0.3 + 2)) * 180) / Math.PI + 360) % 360, vertical_rate: 100, on_ground: false, last_contact: now },
    { icao24: "ac7d44", callsign: "EJA524", latitude: PDK_LAT - 0.12 + Math.cos(t * 0.4 + 3) * 0.08, longitude: PDK_LNG - 0.08 + Math.sin(t * 0.4 + 3) * 0.06, altitude: 8500, velocity: 250, heading: Math.round((Math.atan2(Math.sin(t * 0.4 + 3), Math.cos(t * 0.4 + 3)) * 180) / Math.PI + 360) % 360, vertical_rate: 1500, on_ground: false, last_contact: now },
    { icao24: "a67890", callsign: "N67890", latitude: PDK_LAT - 0.02 + Math.sin(t * 0.6 + 4) * 0.015, longitude: PDK_LNG - 0.01 + Math.cos(t * 0.6 + 4) * 0.02, altitude: 1800, velocity: 80, heading: Math.round((Math.atan2(Math.cos(t * 0.6 + 4), -Math.sin(t * 0.6 + 4)) * 180) / Math.PI + 360) % 360, vertical_rate: -500, on_ground: false, last_contact: now },
  ];
}
