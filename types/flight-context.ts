export type RiskLevel = "GREEN" | "AMBER" | "RED";

export interface SourceRef {
  provider: string;
  product: string;
  identifier?: string;
  observedAt?: string;
  validFrom?: string;
  validTo?: string;
  url?: string;
  raw?: string;
}

export interface AirportRef {
  icao: string;
  iata?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

export interface MetarSnapshot {
  station: string;
  raw: string;
  observedAt?: string;
  flightCategory?: string;
  visibilitySm?: number;
  ceilingFt?: number;
  windDirectionDeg?: number;
  windSpeedKt?: number;
  windGustKt?: number;
  temperatureC?: number;
  dewpointC?: number;
  altimeterHg?: number;
  source: SourceRef;
}

export interface TafSnapshot {
  station: string;
  raw: string;
  issuedAt?: string;
  validFrom?: string;
  validTo?: string;
  source: SourceRef;
}

export interface WeatherHazard {
  id: string;
  type: "SIGMET" | "G-AIRMET" | "PIREP" | "CWA" | "OTHER";
  severity?: string;
  description: string;
  validFrom?: string;
  validTo?: string;
  geometry?: unknown;
  source: SourceRef;
}

export interface AirportWeatherContext {
  airport: AirportRef;
  metar?: MetarSnapshot;
  taf?: TafSnapshot;
}

export interface WeatherContext {
  departure?: AirportWeatherContext;
  destination?: AirportWeatherContext;
  alternates: AirportWeatherContext[];
  hazards: WeatherHazard[];
  fetchedAt: string;
}

export interface AircraftContext {
  tailNumber?: string;
  type?: string;
  make?: string;
  model?: string;
  fuelGallons?: number;
  fuelEnduranceMinutes?: number;
  melItems?: Array<{
    code?: string;
    title: string;
    status?: string;
    restriction?: string;
  }>;
}

export interface CrewContext {
  members?: Array<{
    name?: string;
    role?: string;
    dutyMinutesRemaining?: number;
    currencyWarnings?: string[];
  }>;
}

export interface RuleContext {
  operatorId?: string;
  operatorName?: string;
  procedureRefs?: SourceRef[];
  faaRefs?: SourceRef[];
  constraints?: string[];
}

export interface FlightContext {
  flightId: string;
  callsign?: string;
  departure: AirportRef;
  destination: AirportRef;
  alternates: AirportRef[];
  plannedDeparture?: string;
  estimatedArrival?: string;
  route?: string[];
  aircraft?: AircraftContext;
  crew?: CrewContext;
  rules?: RuleContext;
  weather?: WeatherContext;
  updatedAt: string;
}

export interface AgentFinding {
  agent: "weather" | "flight" | "rules" | "aircraft" | "crew" | "orchestrator";
  level: RiskLevel;
  title: string;
  summary: string;
  reason: string;
  affectedPhase?: string;
  evidence: SourceRef[];
  confidence: number;
}

export interface OperationalOption {
  id: string;
  title: string;
  description: string;
  status: "RECOMMENDED" | "VIABLE" | "CONDITIONAL" | "BLOCKED";
  risk: RiskLevel;
  delayMinutes?: number;
  fuelImpactGallons?: number;
  requirements: string[];
  blockers: string[];
  tradeoffs: string[];
  evidence: SourceRef[];
  confidence: number;
}

export interface AerosOperationalAnalysis {
  flightId: string;
  overallRisk: RiskLevel;
  executiveSummary: string;
  changes: string[];
  findings: AgentFinding[];
  options: OperationalOption[];
  unansweredQuestions: string[];
  generatedAt: string;
}
