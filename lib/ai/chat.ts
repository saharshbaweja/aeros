import { getSystemPrompt } from "./prompts";
import {
  mockFlights,
  mockAircraft,
  mockAlerts,
  mockWeather,
} from "@/lib/mock-data";
import { formatTime, getServiceTypeLabel } from "@/lib/utils";

export function buildContext() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todaysFlights = mockFlights
    .map(
      (f) =>
        `- ${formatTime(f.flight_time)} | ${f.aircraft?.tail_number || "TBD"} | ${f.customer_name} | ${getServiceTypeLabel(f.service_type)} | ${f.status}`
    )
    .join("\n");

  const aircraftStatus = mockAircraft
    .map(
      (a) =>
        `- ${a.tail_number} (${a.make} ${a.model}): ${a.status} | ${a.total_flight_hours} total hours`
    )
    .join("\n");

  const activeAlerts = mockAlerts
    .filter((a) => a.status === "active")
    .map((a) => `- [${a.priority.toUpperCase()}] ${a.message}`)
    .join("\n");

  return getSystemPrompt({
    fboName: "SkyHaven FBO",
    airportCode: "KPDK",
    currentDate: today,
    currentWeather: `${mockWeather.raw_metar} (${mockWeather.flight_category} - ${mockWeather.conditions})`,
    todaysFlights: todaysFlights || "No flights scheduled",
    aircraftStatus,
    activeAlerts: activeAlerts || "No active alerts",
  });
}
