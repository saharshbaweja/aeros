import { NextRequest, NextResponse } from "next/server";
import { buildWeatherContext } from "@/lib/aviation/weather";
import { analyzeFlightContext } from "@/lib/ai/orchestrator";
import type { AirportRef, FlightContext } from "@/types/flight-context";

function normalizeAirport(input: string | AirportRef): AirportRef {
  if (typeof input === "string") {
    return { icao: input.trim().toUpperCase() };
  }

  return {
    ...input,
    icao: input.icao.trim().toUpperCase(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.departure || !body?.destination) {
      return NextResponse.json(
        { error: "departure and destination are required" },
        { status: 400 }
      );
    }

    const departure = normalizeAirport(body.departure);
    const destination = normalizeAirport(body.destination);
    const alternates = Array.isArray(body.alternates)
      ? body.alternates.map(normalizeAirport)
      : [];

    const weather = await buildWeatherContext({
      departure,
      destination,
      alternates,
    });

    const context: FlightContext = {
      flightId: body.flightId || `${departure.icao}-${destination.icao}-${Date.now()}`,
      callsign: body.callsign,
      departure,
      destination,
      alternates,
      plannedDeparture: body.plannedDeparture,
      estimatedArrival: body.estimatedArrival,
      route: body.route,
      aircraft: body.aircraft,
      crew: body.crew,
      rules: body.rules,
      weather,
      updatedAt: new Date().toISOString(),
    };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        context,
        analysis: null,
        mode: "data-only",
        warning:
          "Live aviation data loaded, but OPENAI_API_KEY is not configured so operational analysis was not run.",
      });
    }

    const analysis = await analyzeFlightContext(context);

    return NextResponse.json({
      context,
      analysis,
      mode: "live",
    });
  } catch (error: unknown) {
    console.error("Aeros intelligence API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Unable to build operational intelligence",
        detail: message,
      },
      { status: 500 }
    );
  }
}
