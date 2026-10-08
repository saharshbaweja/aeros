const CORE_BASE = "https://usc-api.flightschedulepro.com/core/v1.0";
const SCHEDULING_BASE = "https://usc-api.flightschedulepro.com/scheduling/v1.0";
const TRAINING_BASE = "https://usc-api.flightschedulepro.com/training/v1.0";
const REPORTING_BASE = "https://usc-api.flightschedulepro.com/reports/v1.0";

function config() {
  const apiKey = process.env.FSP_API_KEY;
  const operatorId = process.env.FSP_OPERATOR_ID;

  if (!apiKey || !operatorId) {
    throw new Error("Flight Schedule Pro is not configured. Set FSP_API_KEY and FSP_OPERATOR_ID.");
  }

  return { apiKey, operatorId };
}

async function fspFetch<T>(base: string, path: string, params?: URLSearchParams): Promise<T> {
  const { apiKey } = config();
  const url = new URL(`${base}${path}`);
  params?.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-subscription-key": apiKey,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Flight Schedule Pro request failed (${response.status}): ${body.slice(0, 240)}`);
  }

  return response.json() as Promise<T>;
}

function operatorPath(resource: string) {
  const { operatorId } = config();
  return `/operators/${encodeURIComponent(operatorId)}/${resource}`;
}

export async function fetchFspAircraft() {
  return fspFetch<unknown[]>(CORE_BASE, operatorPath("aircraft"));
}

export async function fetchFspInstructors() {
  return fspFetch<unknown[]>(CORE_BASE, operatorPath("instructors"));
}

export async function fetchFspPeople() {
  return fspFetch<unknown[]>(CORE_BASE, operatorPath("people"));
}

export async function fetchFspReservations(args?: { fromUtc?: string; toUtc?: string; tailNumber?: string }) {
  const params = new URLSearchParams();
  if (args?.fromUtc) params.set("startTimeUtc", `Gte:${args.fromUtc}`);
  if (args?.toUtc) params.set("endTimeUtc", `Lte:${args.toUtc}`);
  if (args?.tailNumber) params.set("tailNumber", args.tailNumber);

  return fspFetch<unknown[]>(SCHEDULING_BASE, operatorPath("reservations"), params);
}

export async function fetchFspAircraftMaintenanceReminders(aircraftId: string) {
  return fspFetch<unknown[]>(
    CORE_BASE,
    operatorPath(`aircraft/${encodeURIComponent(aircraftId)}/maintenanceReminders`)
  );
}

export async function fetchFspAircraftSquawks(aircraftId: string) {
  return fspFetch<unknown[]>(CORE_BASE, operatorPath(`aircraft/${encodeURIComponent(aircraftId)}/squawks`));
}

export async function fetchFspFlights(args?: { from?: string; to?: string; lastUpdated?: string }) {
  const params = new URLSearchParams();
  if (args?.from) params.set("FlightDate", `Gte:${args.from}`);
  if (args?.to) params.set("FlightDateRangeEndDate", `Lte:${args.to}`);
  if (args?.lastUpdated) params.set("LastUpdated", `Gte:${args.lastUpdated}`);

  return fspFetch<unknown[]>(REPORTING_BASE, operatorPath("flights"), params);
}

export async function fetchFspStudentProgress(args?: { lastUpdated?: string }) {
  const params = new URLSearchParams();
  if (args?.lastUpdated) params.set("LastUpdated", `Gte:${args.lastUpdated}`);
  return fspFetch<unknown[]>(REPORTING_BASE, operatorPath("studentprogress"), params);
}

export async function fetchFspTrainingSession(trainingSessionId: string) {
  return fspFetch<unknown>(
    TRAINING_BASE,
    operatorPath(`trainingSessions/${encodeURIComponent(trainingSessionId)}`)
  );
}

export function isFspConfigured() {
  return Boolean(process.env.FSP_API_KEY && process.env.FSP_OPERATOR_ID);
}
