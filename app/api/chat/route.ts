import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildWeatherContext } from "@/lib/aviation/weather";
import { runAgentMesh } from "@/lib/agents/blackboard";
import type { AirportRef, FlightContext } from "@/types/flight-context";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

function airport(input: string | AirportRef | undefined, fallback: string): AirportRef {
  if (!input) return { icao: fallback };
  if (typeof input === "string") return { icao: input.trim().toUpperCase() };
  return { ...input, icao: input.icao.trim().toUpperCase() };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUserMessage = [...messages].reverse().find((message) => message?.role === "user");
    const question = String(lastUserMessage?.content || body?.question || "").trim();

    if (!question) {
      return NextResponse.json({ message: "Ask Aeros needs a question." }, { status: 400 });
    }

    const mission = body?.mission || {};
    const departure = airport(mission.departure, "KPDK");
    const destination = airport(mission.destination, "KCHA");
    const alternates = Array.isArray(mission.alternates)
      ? mission.alternates.map((item: string | AirportRef) => airport(item, "KRMG"))
      : [{ icao: "KRMG" }];

    const weather = await buildWeatherContext({ departure, destination, alternates });

    const context: FlightContext = {
      flightId: mission.flightId || "AEROS-DEMO-142",
      callsign: mission.callsign,
      departure,
      destination,
      alternates,
      plannedDeparture: mission.plannedDeparture,
      estimatedArrival: mission.estimatedArrival,
      route: mission.route,
      aircraft: mission.aircraft || { tailNumber: "N731GT", type: "C172" },
      crew: mission.crew,
      rules: mission.rules,
      weather,
      updatedAt: new Date().toISOString(),
    };

    const mesh = await runAgentMesh(context);

    if (!process.env.OPENAI_API_KEY) {
      const destinationCategory = context.weather?.destination?.metar?.flightCategory || "unknown";
      return NextResponse.json({
        message: `Live mission context is available, but final language-model reasoning is disabled because OPENAI_API_KEY is not configured. Current ${destination.icao} METAR category: ${destinationCategory}.`,
        context,
        mesh,
        mode: "data-and-agents",
      });
    }

    const response = await openai.responses.create({
      model: process.env.AEROS_MODEL || "gpt-6.1-sol",
      reasoning: { effort: "medium" },
      instructions: `You are Ask Aeros, the natural-language interface to the Aeros aviation operational intelligence layer.

Answer only from the mission context and specialist claims supplied in the request. Do not invent live weather, NOTAMs, aircraft state, maintenance, crew, qualification, operator policy, regulatory requirements, fuel/performance numbers, or legal conclusions. If the question depends on missing data, say exactly what is missing and how it affects confidence. Distinguish observed facts from inference. Cite source product/station identifiers inline when useful. Never imply you replace required pilot-in-command, dispatcher, maintenance-control, or regulatory authority.

Be concise and operational: explain what changed, why it matters, which dependency is affected, and what should be checked or simulated next.`,
      input: `QUESTION:\n${question}\n\nMISSION CONTEXT:\n${JSON.stringify(context)}\n\nSPECIALIST CLAIMS:\n${JSON.stringify(mesh.claims)}`,
    });

    return NextResponse.json({
      message: response.output_text || "Aeros could not produce an answer from the available mission context.",
      context,
      mesh,
      mode: "live",
    });
  } catch (error: unknown) {
    console.error("Ask Aeros API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Aeros could not build the mission context for that question.", detail: message },
      { status: 500 }
    );
  }
}
