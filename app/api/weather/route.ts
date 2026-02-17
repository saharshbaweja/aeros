import { NextRequest, NextResponse } from "next/server";
import { mockWeather } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station") || "KPDK";

  // In production, this would call the Aviation Weather API
  // For now, return mock data
  try {
    // Try fetching real METAR data
    const response = await fetch(
      `https://aviationweather.gov/api/data/metar?ids=${station}&format=json`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const metar = data[0];
        return NextResponse.json({
          raw_metar: metar.rawOb,
          station: metar.icaoId,
          temperature: metar.temp,
          dewpoint: metar.dewp,
          wind_direction: metar.wdir,
          wind_speed: metar.wspd,
          wind_gust: metar.wgst || undefined,
          visibility: metar.visib,
          flight_category: metar.fltcat,
          conditions: `Raw observation: ${metar.rawOb}`,
        });
      }
    }
  } catch {
    // Fall through to mock data
  }

  return NextResponse.json(mockWeather);
}
