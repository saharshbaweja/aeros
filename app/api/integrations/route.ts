import { NextResponse } from "next/server";
import { getIntegrationRuntimeStatus } from "@/lib/integrations/catalog";

export async function GET() {
  const integrations = getIntegrationRuntimeStatus();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      connected: integrations.filter((item) => item.connected).length,
      configurable: integrations.filter((item) => item.status === "CONFIGURABLE").length,
      planned: integrations.filter((item) => item.status === "PLANNED").length,
      restricted: integrations.filter((item) => item.status === "RESTRICTED").length,
    },
    integrations,
  });
}
