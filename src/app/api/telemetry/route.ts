import { NextResponse } from "next/server";
import { getDemoTelemetry } from "@/lib/demo-data";
import { ApiEnvelope, TelemetrySnapshot } from "@/types";

export async function GET() {
  const baseline = getDemoTelemetry();
  const telemetry: TelemetrySnapshot = {
    ...baseline,
    lastSync: new Date().toISOString(),
    simulated: true,
  };

  return NextResponse.json(
    {
      ok: true,
      data: telemetry,
      meta: {
        source: "demo",
        fetchedAt: new Date().toISOString(),
        note: "Telemetry values are local estimates/simulated demo metrics.",
      },
    } satisfies ApiEnvelope<TelemetrySnapshot>,
    {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
      },
    },
  );
}
