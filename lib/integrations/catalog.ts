export type IntegrationStatus = "LIVE" | "CONFIGURABLE" | "PLANNED" | "RESTRICTED";

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: "WEATHER" | "OPS_SYSTEM" | "FLIGHT_TRACKING" | "AERONAUTICAL" | "NOTAM" | "DOCUMENTS" | "COMMUNICATIONS" | "AVIONICS";
  status: IntegrationStatus;
  description: string;
  capabilities: string[];
  env?: string[];
  authority?: string;
  cadence?: string;
  notes?: string;
}

export const integrationCatalog: IntegrationDefinition[] = [
  {
    id: "aviation-weather",
    name: "AviationWeather.gov",
    category: "WEATHER",
    status: "LIVE",
    authority: "NOAA / NWS Aviation Weather Center",
    cadence: "METAR ~1 min cache; TAF ~10 min cache",
    description: "Primary machine-readable weather source for mission weather context.",
    capabilities: ["METAR", "TAF", "PIREPs/AIREPs", "SIGMET", "G-AIRMET", "CWA", "airport/station data"],
  },
  {
    id: "opensky",
    name: "OpenSky Network",
    category: "FLIGHT_TRACKING",
    status: "LIVE",
    description: "ADS-B/state-vector fallback used by the current map and live traffic layer.",
    capabilities: ["position", "altitude", "ground speed", "track", "vertical rate", "callsign"],
  },
  {
    id: "flighttrackerpro",
    name: "FlightTrackerPro",
    category: "FLIGHT_TRACKING",
    status: "CONFIGURABLE",
    env: ["FLIGHTRACKER_PRO_API_KEY"],
    description: "Optional higher-fidelity aircraft tracking source already supported by the ADS-B route.",
    capabilities: ["position", "altitude", "ground speed", "track", "vertical rate", "callsign"],
  },
  {
    id: "flight-schedule-pro",
    name: "Pilotbase / Flight Schedule Pro",
    category: "OPS_SYSTEM",
    status: "CONFIGURABLE",
    env: ["FSP_API_KEY", "FSP_OPERATOR_ID"],
    description: "Read-only operator-system adapter for importing the schedule and operational state into Aeros.",
    capabilities: [
      "aircraft",
      "maintenance reminders",
      "squawks",
      "instructors",
      "people/users",
      "reservations",
      "flights/reporting",
      "training data",
    ],
    notes: "The public FSP API is currently read-only; Aeros execution writes must use approved integrations or human-in-the-loop handoff until write APIs are available.",
  },
  {
    id: "faa-nasr",
    name: "FAA NASR",
    category: "AERONAUTICAL",
    status: "PLANNED",
    authority: "Federal Aviation Administration",
    cadence: "28-day publication cycle",
    description: "Canonical U.S. airport, runway, airspace, navaid, frequency and route data foundation.",
    capabilities: ["airports", "runways", "navaids", "fixes", "airspace", "frequencies", "preferred routes", "STAR/DP references"],
  },
  {
    id: "faa-cifp",
    name: "FAA CIFP",
    category: "AERONAUTICAL",
    status: "PLANNED",
    authority: "Federal Aviation Administration",
    cadence: "28-day publication cycle",
    description: "ARINC 424 coded instrument procedure source for terminal and en-route procedure intelligence.",
    capabilities: ["airports/heliports", "runways", "waypoints", "airways", "DP", "STAR", "approaches", "special-use airspace"],
  },
  {
    id: "faa-notam",
    name: "FAA NOTAM Management Service",
    category: "NOTAM",
    status: "RESTRICTED",
    authority: "Federal Aviation Administration",
    description: "Authoritative near-real-time NOTAM source. Production access requires FAA NMS API onboarding.",
    capabilities: ["airport NOTAMs", "runway restrictions", "navaid outages", "procedure impacts", "effective windows"],
  },
  {
    id: "operator-documents",
    name: "Operator Knowledge Base",
    category: "DOCUMENTS",
    status: "PLANNED",
    description: "Versioned retrieval layer for company-specific policy and aircraft operating material.",
    capabilities: ["SOPs", "OpsSpecs", "company minima", "MEL/CDL", "POH/AFM excerpts", "checklists", "safety policy"],
  },
  {
    id: "avionics-fdm",
    name: "Avionics / FDM",
    category: "AVIONICS",
    status: "PLANNED",
    description: "Post-flight telemetry and anomaly ingestion that closes the planning-to-learning loop.",
    capabilities: ["track logs", "flight parameters", "exceedance detection", "lesson debrief context", "maintenance signals"],
  },
  {
    id: "communications",
    name: "Communications",
    category: "COMMUNICATIONS",
    status: "PLANNED",
    description: "Human-approved execution channel for operational notifications and workflow handoffs.",
    capabilities: ["SMS", "email", "pilot/instructor notifications", "customer updates", "approval requests"],
  },
];

export function getIntegrationRuntimeStatus() {
  return integrationCatalog.map((integration) => {
    const configured = !integration.env?.length || integration.env.every((key) => Boolean(process.env[key]));
    const connected = integration.status === "LIVE" || (integration.status === "CONFIGURABLE" && configured);

    return {
      ...integration,
      connected,
      missingEnvironment: integration.env?.filter((key) => !process.env[key]) || [],
    };
  });
}
