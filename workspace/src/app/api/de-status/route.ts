import { NextResponse } from "next/server";
import { isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";

/**
 * API endpoint to check Digital Evidence status
 * Used by the DEStatusBanner component
 */
export async function GET() {
  const enabled = isDigitalEvidenceEnabled();

  return NextResponse.json({
    enabled,
    message: enabled
      ? "Digital Evidence integration active"
      : "Digital Evidence keys not configured",
  });
}
