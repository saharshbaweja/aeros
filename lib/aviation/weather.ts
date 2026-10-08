import type {
  AirportRef,
  AirportWeatherContext,
  MetarSnapshot,
  TafSnapshot,
  WeatherContext,
  WeatherHazard,
} from "@/types/flight-context";

const BASE_URL = "https://aviationweather.gov/api/data";
const CACHE_SECONDS = 60;

function source(product: string, raw?: string, identifier?: string) {
  return {
    provider: "AviationWeather.gov",
    product,
    identifier,
    url: "https://aviationweather.gov/data/api/",
    raw,
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`AviationWeather request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

function normalizeStation(icao: string) {
  return icao.trim().toUpperCase();
}

function extractCeilingFt(clouds: Array<{ cover?: string; base?: number }> | undefined) {
  if (!clouds?.length) return undefined;
  const ceiling = clouds.find((layer) =>
    ["BKN", "OVC", "VV"].includes(String(layer.cover || "").toUpperCase())
  );
  return ceiling?.base;
}

export async function fetchMetar(icao: string): Promise<MetarSnapshot | undefined> {
  const station = normalizeStation(icao);
  const data = await getJson<any[]>(`/metar?ids=${encodeURIComponent(station)}&format=json`);
  const item = data?.[0];
  if (!item) return undefined;

  return {
    station: item.icaoId || station,
    raw: item.rawOb || "",
    observedAt: item.reportTime || item.obsTime,
    flightCategory: item.fltcat,
    visibilitySm: typeof item.visib === "number" ? item.visib : Number(item.visib),
    ceilingFt: extractCeilingFt(item.clouds),
    windDirectionDeg: item.wdir,
    windSpeedKt: item.wspd,
    windGustKt: item.wgst,
    temperatureC: item.temp,
    dewpointC: item.dewp,
    altimeterHg: item.altim,
    source: source("METAR", item.rawOb, item.icaoId || station),
  };
}

export async function fetchTaf(icao: string): Promise<TafSnapshot | undefined> {
  const station = normalizeStation(icao);
  const data = await getJson<any[]>(`/taf?ids=${encodeURIComponent(station)}&format=json`);
  const item = data?.[0];
  if (!item) return undefined;

  return {
    station: item.icaoId || station,
    raw: item.rawTAF || item.rawOb || "",
    issuedAt: item.issueTime,
    validFrom: item.validTimeFrom || item.validTime?.from,
    validTo: item.validTimeTo || item.validTime?.to,
    source: source("TAF", item.rawTAF || item.rawOb, item.icaoId || station),
  };
}

export async function fetchAirportWeather(airport: AirportRef): Promise<AirportWeatherContext> {
  const [metar, taf] = await Promise.all([
    fetchMetar(airport.icao).catch(() => undefined),
    fetchTaf(airport.icao).catch(() => undefined),
  ]);

  return { airport, metar, taf };
}

export async function fetchSigmets(): Promise<WeatherHazard[]> {
  const data = await getJson<any[]>("/airsigmet?format=json").catch(() => []);

  return (data || []).slice(0, 100).map((item, index) => ({
    id: String(item.airsigmetId || item.id || `sigmet-${index}`),
    type: "SIGMET" as const,
    severity: item.hazard || item.severity,
    description:
      item.rawAirSigmet || item.rawSigmet || item.hazard || "Active SIGMET/AIRMET hazard",
    validFrom: item.validTimeFrom || item.issueTime,
    validTo: item.validTimeTo || item.expireTime,
    geometry: item.coords || item.geometry,
    source: source(
      "SIGMET/AIRMET",
      item.rawAirSigmet || item.rawSigmet,
      String(item.airsigmetId || item.id || index)
    ),
  }));
}

export async function buildWeatherContext(args: {
  departure: AirportRef;
  destination: AirportRef;
  alternates?: AirportRef[];
}): Promise<WeatherContext> {
  const alternates = args.alternates || [];
  const [departure, destination, alternateWeather, hazards] = await Promise.all([
    fetchAirportWeather(args.departure),
    fetchAirportWeather(args.destination),
    Promise.all(alternates.map(fetchAirportWeather)),
    fetchSigmets(),
  ]);

  return {
    departure,
    destination,
    alternates: alternateWeather,
    hazards,
    fetchedAt: new Date().toISOString(),
  };
}
