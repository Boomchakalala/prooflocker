import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check environment variables
 * DO NOT EXPOSE IN PRODUCTION - REMOVE AFTER DEBUGGING
 */
export async function GET() {
  const envCheck = {
    DE_API_KEY: process.env.DE_API_KEY ? `Set (${process.env.DE_API_KEY.substring(0, 10)}...)` : "❌ Missing",
    DE_TENANT_ID: process.env.DE_TENANT_ID ? "✅ Set" : "❌ Missing",
    DE_ORG_ID: process.env.DE_ORG_ID ? "✅ Set" : "❌ Missing",
    DE_SIGNING_PRIVATE_KEY_HEX: process.env.DE_SIGNING_PRIVATE_KEY_HEX ? "✅ Set" : "❌ Missing",
    DE_API_URL: process.env.DE_API_URL || "Using default",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
  };

  return NextResponse.json({
    message: "Environment Variable Check",
    variables: envCheck,
    allDEVarsPresent: !!(
      process.env.DE_API_KEY &&
      process.env.DE_TENANT_ID &&
      process.env.DE_ORG_ID &&
      process.env.DE_SIGNING_PRIVATE_KEY_HEX
    ),
  });
}
