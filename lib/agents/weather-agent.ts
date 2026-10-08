import type { FlightContext } from "@/types/flight-context";
import type { OperationalClaim } from "@/types/operational-graph";

function severityForCategory(category?: string) {
  switch (category?.toUpperCase()) {
    case "LIFR":
      return "HIGH" as const;
    case "IFR":
      return "MEDIUM" as const;
    case "MVFR":
      return "LOW" as const;
    default:
      return "INFO" as const;
  }
}

function claimId(flightId: string, suffix: string) {
  return `weather:${flightId}:${suffix}`;
}

export async function runWeatherAgent(context: FlightContext): Promise<OperationalClaim[]> {
  const now = new Date().toISOString();
  const claims: OperationalClaim[] = [];
  const missionRef = { type: "mission" as const, id: context.flightId, label: context.callsign };

  const stations = [
    ["departure", context.weather?.departure],
    ["destination", context.weather?.destination],
    ...((context.weather?.alternates || []).map((weather, index) => [`alternate-${index + 1}`, weather] as const)),
  ] as const;

  for (const [role, weather] of stations) {
    if (!weather) continue;

    if (!weather.metar) {
      claims.push({
        id: claimId(context.flightId, `${role}:metar-missing`),
        organizationId: context.rules?.operatorId || "unknown",
        missionId: context.flightId,
        subject: missionRef,
        predicate: `${String(role).toUpperCase()}_METAR_AVAILABLE`,
        value: false,
        severity: "MEDIUM",
        confidence: 1,
        status: "ASSERTED",
        assertedBy: "weather-agent",
        assertedAt: now,
        dependencies: ["weather.metar"],
        evidence: [],
      });
      continue;
    }

    claims.push({
      id: claimId(context.flightId, `${role}:flight-category`),
      organizationId: context.rules?.operatorId || "unknown",
      missionId: context.flightId,
      subject: missionRef,
      predicate: `${String(role).toUpperCase()}_FLIGHT_CATEGORY`,
      value: weather.metar.flightCategory || "UNKNOWN",
      severity: severityForCategory(weather.metar.flightCategory),
      confidence: 1,
      status: "ASSERTED",
      assertedBy: "weather-agent",
      assertedAt: now,
      dependencies: ["weather.metar", "mission.timing"],
      evidence: [
        {
          provider: weather.metar.source.provider,
          product: weather.metar.source.product,
          sourceId: weather.metar.source.identifier,
          sourceUrl: weather.metar.source.url,
          observedAt: weather.metar.observedAt,
          excerpt: weather.metar.raw,
        },
      ],
    });

    if (weather.taf) {
      claims.push({
        id: claimId(context.flightId, `${role}:taf-present`),
        organizationId: context.rules?.operatorId || "unknown",
        missionId: context.flightId,
        subject: missionRef,
        predicate: `${String(role).toUpperCase()}_FORECAST_CONTEXT_AVAILABLE`,
        value: true,
        severity: "INFO",
        confidence: 1,
        status: "ASSERTED",
        assertedBy: "weather-agent",
        assertedAt: now,
        validFrom: weather.taf.validFrom,
        validTo: weather.taf.validTo,
        dependencies: ["weather.taf", "mission.eta"],
        evidence: [
          {
            provider: weather.taf.source.provider,
            product: weather.taf.source.product,
            sourceId: weather.taf.source.identifier,
            sourceUrl: weather.taf.source.url,
            effectiveFrom: weather.taf.validFrom,
            effectiveTo: weather.taf.validTo,
            excerpt: weather.taf.raw,
          },
        ],
      });
    }
  }

  const hazards = context.weather?.hazards || [];
  claims.push({
    id: claimId(context.flightId, "hazards:feed"),
    organizationId: context.rules?.operatorId || "unknown",
    missionId: context.flightId,
    subject: missionRef,
    predicate: "WEATHER_HAZARD_FEED_COUNT",
    value: hazards.length,
    severity: hazards.length ? "LOW" : "INFO",
    confidence: 1,
    status: "ASSERTED",
    assertedBy: "weather-agent",
    assertedAt: now,
    dependencies: ["weather.hazards", "mission.route"],
    evidence: hazards.slice(0, 10).map((hazard) => ({
      provider: hazard.source.provider,
      product: hazard.source.product,
      sourceId: hazard.source.identifier,
      sourceUrl: hazard.source.url,
      effectiveFrom: hazard.validFrom,
      effectiveTo: hazard.validTo,
      excerpt: hazard.description,
    })),
  });

  return claims;
}
