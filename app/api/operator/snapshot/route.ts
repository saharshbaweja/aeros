import { NextRequest, NextResponse } from "next/server";
import {
  fetchFspAircraft,
  fetchFspFlights,
  fetchFspInstructors,
  fetchFspPeople,
  fetchFspReservations,
  fetchFspStudentProgress,
  isFspConfigured,
} from "@/lib/integrations/flight-schedule-pro";

async function settled<T>(label: string, promise: Promise<T>) {
  try {
    return { label, ok: true as const, data: await promise };
  } catch (error: unknown) {
    return {
      label,
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown integration error",
    };
  }
}

export async function GET(req: NextRequest) {
  if (!isFspConfigured()) {
    return NextResponse.json(
      {
        connected: false,
        source: "Pilotbase / Flight Schedule Pro",
        requiredEnvironment: ["FSP_API_KEY", "FSP_OPERATOR_ID"],
        message: "Configure the operator adapter before requesting a live snapshot.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date().toISOString();
  const to =
    searchParams.get("to") ||
    new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();

  const flightFrom = from.slice(0, 10);
  const flightTo = to.slice(0, 10);

  const resources = await Promise.all([
    settled("aircraft", fetchFspAircraft()),
    settled("instructors", fetchFspInstructors()),
    settled("people", fetchFspPeople()),
    settled("reservations", fetchFspReservations({ fromUtc: from, toUtc: to })),
    settled("flights", fetchFspFlights({ from: flightFrom, to: flightTo })),
    settled("studentProgress", fetchFspStudentProgress()),
  ]);

  const failures = resources.filter((resource) => !resource.ok);

  return NextResponse.json({
    connected: true,
    source: "Pilotbase / Flight Schedule Pro",
    window: { from, to },
    fetchedAt: new Date().toISOString(),
    partial: failures.length > 0,
    resources: Object.fromEntries(
      resources.map((resource) => [
        resource.label,
        resource.ok
          ? resource.data
          : { unavailable: true, error: resource.error },
      ])
    ),
  });
}
