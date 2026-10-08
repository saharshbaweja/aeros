import OpenAI from "openai";
import type {
  AerosOperationalAnalysis,
  FlightContext,
} from "@/types/flight-context";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    flightId: { type: "string" },
    overallRisk: { type: "string", enum: ["GREEN", "AMBER", "RED"] },
    executiveSummary: { type: "string" },
    changes: { type: "array", items: { type: "string" } },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          agent: {
            type: "string",
            enum: ["weather", "flight", "rules", "aircraft", "crew", "orchestrator"],
          },
          level: { type: "string", enum: ["GREEN", "AMBER", "RED"] },
          title: { type: "string" },
          summary: { type: "string" },
          reason: { type: "string" },
          affectedPhase: { type: ["string", "null"] },
          evidence: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                provider: { type: "string" },
                product: { type: "string" },
                identifier: { type: ["string", "null"] },
                observedAt: { type: ["string", "null"] },
                validFrom: { type: ["string", "null"] },
                validTo: { type: ["string", "null"] },
                url: { type: ["string", "null"] },
                raw: { type: ["string", "null"] },
              },
              required: [
                "provider",
                "product",
                "identifier",
                "observedAt",
                "validFrom",
                "validTo",
                "url",
                "raw",
              ],
            },
          },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: [
          "agent",
          "level",
          "title",
          "summary",
          "reason",
          "affectedPhase",
          "evidence",
          "confidence",
        ],
      },
    },
    options: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["RECOMMENDED", "VIABLE", "CONDITIONAL", "BLOCKED"],
          },
          risk: { type: "string", enum: ["GREEN", "AMBER", "RED"] },
          delayMinutes: { type: ["integer", "null"] },
          fuelImpactGallons: { type: ["number", "null"] },
          requirements: { type: "array", items: { type: "string" } },
          blockers: { type: "array", items: { type: "string" } },
          tradeoffs: { type: "array", items: { type: "string" } },
          evidence: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                provider: { type: "string" },
                product: { type: "string" },
                identifier: { type: ["string", "null"] },
                observedAt: { type: ["string", "null"] },
                validFrom: { type: ["string", "null"] },
                validTo: { type: ["string", "null"] },
                url: { type: ["string", "null"] },
                raw: { type: ["string", "null"] },
              },
              required: [
                "provider",
                "product",
                "identifier",
                "observedAt",
                "validFrom",
                "validTo",
                "url",
                "raw",
              ],
            },
          },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: [
          "id",
          "title",
          "description",
          "status",
          "risk",
          "delayMinutes",
          "fuelImpactGallons",
          "requirements",
          "blockers",
          "tradeoffs",
          "evidence",
          "confidence",
        ],
      },
    },
    unansweredQuestions: { type: "array", items: { type: "string" } },
    generatedAt: { type: "string" },
  },
  required: [
    "flightId",
    "overallRisk",
    "executiveSummary",
    "changes",
    "findings",
    "options",
    "unansweredQuestions",
    "generatedAt",
  ],
};

const SYSTEM_PROMPT = `You are the Aeros operational intelligence orchestrator.

Your job is to convert structured flight context into a conservative, evidence-backed operational assessment.

Rules:
- Never invent weather, aircraft, crew, legal, MEL, NOTAM, performance, or operator constraints.
- Treat provided data as authoritative only for the fields actually present.
- If information required for a legal or safety conclusion is missing, explicitly identify it in unansweredQuestions.
- Do not claim an operation is legal, safe, or dispatchable unless the supplied context is sufficient to support that conclusion.
- Separate observed facts from inference.
- Every material finding and operational option must cite evidence from the supplied context when evidence exists.
- Prefer operationally useful options over generic advice.
- Options may include continue, delay, reroute, divert, change alternate, change aircraft, add fuel, request maintenance action, or hold for more information, but only when supported by context.
- Confidence must reflect data completeness.
- This output is decision support, not pilot-in-command or dispatcher authority.
`;

export async function analyzeFlightContext(
  context: FlightContext
): Promise<AerosOperationalAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await client.responses.create({
    model: process.env.AEROS_MODEL || "gpt-6.1-sol",
    reasoning: { effort: "medium" },
    instructions: SYSTEM_PROMPT,
    input: `Analyze this flight context and return the operational assessment.\n\n${JSON.stringify(
      context
    )}`,
    text: {
      format: {
        type: "json_schema",
        name: "aeros_operational_analysis",
        strict: true,
        schema: analysisSchema,
      },
    },
  });

  if (!response.output_text) {
    throw new Error("Aeros model returned no structured output");
  }

  return JSON.parse(response.output_text) as AerosOperationalAnalysis;
}
