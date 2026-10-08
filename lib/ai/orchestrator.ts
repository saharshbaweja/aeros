import OpenAI from "openai";
import type {
  AerosOperationalAnalysis,
  FlightContext,
} from "@/types/flight-context";
import type { OperationalClaim } from "@/types/operational-graph";

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

const SYSTEM_PROMPT = `You are the Aeros operational intelligence synthesizer.

Aeros maintains a shared operational state. Specialist agents publish typed claims backed by external data and deterministic checks. Your job is to synthesize the supplied mission context and claims into a conservative operational assessment and comparable recovery options.

Rules:
- Never invent weather, aircraft, crew, legal, MEL, NOTAM, performance, training, maintenance, or operator constraints.
- Treat specialist claims as assertions with evidence and confidence, not infallible truth.
- Prefer deterministic claims over model inference when they conflict.
- Treat provided source data as authoritative only for fields actually present.
- If information required for a legal or safety conclusion is missing, explicitly identify it in unansweredQuestions.
- Do not claim an operation is legal, safe, or dispatchable unless supplied context is sufficient.
- Separate observed facts from inference.
- Every material finding and option should preserve source evidence when available.
- Prefer operationally useful options over generic advice.
- Options can include continue, delay, reroute, divert, change alternate, add fuel, swap aircraft, reassign resources, request maintenance action, or hold for more information only when supported by context.
- Never propose an execution step that bypasses required pilot, dispatcher, maintenance, operator, or regulatory authority.
- Confidence must reflect data completeness and agent disagreement.
- This output is decision support, not pilot-in-command, dispatcher, maintenance-control, or regulatory authority.
`;

export async function analyzeFlightContext(
  context: FlightContext,
  claims: OperationalClaim[] = []
): Promise<AerosOperationalAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await client.responses.create({
    model: process.env.AEROS_MODEL || "gpt-6.1-sol",
    reasoning: { effort: "medium" },
    instructions: SYSTEM_PROMPT,
    input: `Analyze this mission state and return the operational assessment.\n\nMISSION CONTEXT:\n${JSON.stringify(
      context
    )}\n\nSPECIALIST CLAIMS:\n${JSON.stringify(claims)}`,
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
