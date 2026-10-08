import type { FlightContext } from "@/types/flight-context";
import type { AgentCapability, OperationalClaim } from "@/types/operational-graph";
import { runWeatherAgent } from "./weather-agent";

export const agentCapabilities: AgentCapability[] = [
  {
    id: "weather-agent",
    name: "Weather Intelligence",
    subscribesTo: ["WEATHER_UPDATED", "MISSION_TIMING_CHANGED", "ROUTE_CHANGED"],
    publishes: ["*_FLIGHT_CATEGORY", "*_FORECAST_CONTEXT_AVAILABLE", "WEATHER_HAZARD_FEED_COUNT"],
    tools: ["AviationWeather.gov"],
    deterministicChecks: ["METAR availability", "flight-category classification", "source freshness"],
    humanAuthorityBoundary: ["go/no-go authority", "regulatory weather-minimum interpretation without operator policy"],
  },
  {
    id: "flight-agent",
    name: "Flight Intelligence",
    subscribesTo: ["MISSION_CHANGED", "POSITION_UPDATED", "AIRPORT_STATUS_CHANGED"],
    publishes: ["ROUTE_STATE", "ETA_STATE", "ALTERNATE_CANDIDATES"],
    tools: ["ADS-B", "FAA NASR", "FAA CIFP"],
    deterministicChecks: ["route geometry", "airport/runway availability", "timing"],
  },
  {
    id: "airworthiness-agent",
    name: "Airworthiness Intelligence",
    subscribesTo: ["AIRCRAFT_CHANGED", "SQUAWK_UPDATED", "MAINTENANCE_UPDATED"],
    publishes: ["AIRCRAFT_READINESS", "MAINTENANCE_MARGIN", "AIRWORTHINESS_CONSTRAINTS"],
    tools: ["Pilotbase/FSP", "operator maintenance system"],
    deterministicChecks: ["inspection margin", "open squawks", "maintenance status"],
    humanAuthorityBoundary: ["return-to-service authority", "maintenance signoff"],
  },
  {
    id: "crew-agent",
    name: "Crew Intelligence",
    subscribesTo: ["CREW_CHANGED", "MISSION_TIMING_CHANGED", "QUALIFICATION_UPDATED"],
    publishes: ["CREW_AVAILABILITY", "QUALIFICATION_STATE", "DUTY_MARGIN"],
    tools: ["Pilotbase/FSP", "operator crew system"],
    deterministicChecks: ["availability", "qualification", "currency", "duty/rest margin"],
  },
  {
    id: "training-agent",
    name: "Training Intelligence",
    subscribesTo: ["MISSION_CHANGED", "STUDENT_PROGRESS_UPDATED", "AIRCRAFT_CHANGED"],
    publishes: ["LESSON_COMPATIBILITY", "STUDENT_AIRCRAFT_ELIGIBILITY", "TRAINING_PRIORITY"],
    tools: ["Pilotbase/FSP training API"],
    deterministicChecks: ["lesson requirements", "student progress", "aircraft eligibility"],
  },
  {
    id: "policy-agent",
    name: "Policy Intelligence",
    subscribesTo: ["MISSION_CHANGED", "WEATHER_UPDATED", "AIRCRAFT_CHANGED", "CREW_CHANGED", "POLICY_UPDATED"],
    publishes: ["APPLICABLE_POLICY", "OPERATOR_CONSTRAINT", "REQUIRED_REVIEW"],
    tools: ["operator knowledge base", "FAA source corpus"],
    deterministicChecks: ["version/effective-date resolution"],
    humanAuthorityBoundary: ["final legal interpretation", "dispatcher/PIC authority"],
  },
  {
    id: "recovery-agent",
    name: "Recovery Intelligence",
    subscribesTo: ["MATERIAL_CLAIM_CHANGED", "MISSION_AT_RISK"],
    publishes: ["RECOVERY_OPTION", "DOWNSTREAM_IMPACT", "PROPOSED_ACTION"],
    tools: ["constraint solver", "schedule optimizer", "counterfactual engine"],
    deterministicChecks: ["feasibility", "resource conflicts", "downstream schedule impact"],
  },
  {
    id: "verifier-agent",
    name: "Verification Intelligence",
    subscribesTo: ["HIGH_IMPACT_DECISION_PROPOSED", "LOW_CONFIDENCE_CLAIM"],
    publishes: ["CLAIM_VERIFIED", "CLAIM_CHALLENGED", "MISSING_EVIDENCE"],
    tools: ["independent model pass", "deterministic validators", "source retrieval"],
    humanAuthorityBoundary: ["safety-critical approval"],
  },
];

export interface AgentMeshResult {
  claims: OperationalClaim[];
  capabilities: AgentCapability[];
  ran: string[];
  pending: string[];
}

export async function runAgentMesh(context: FlightContext): Promise<AgentMeshResult> {
  const weatherClaims = await runWeatherAgent(context);

  return {
    claims: weatherClaims,
    capabilities: agentCapabilities,
    ran: ["weather-agent"],
    pending: agentCapabilities
      .map((agent) => agent.id)
      .filter((id) => id !== "weather-agent"),
  };
}
