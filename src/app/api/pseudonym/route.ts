import { NextRequest, NextResponse } from "next/server";
import { setPseudonym } from "@/lib/storage";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    // Verify token server-side with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    const { pseudonym } = await request.json();

    if (!pseudonym || typeof pseudonym !== "string") {
      return NextResponse.json(
        { error: "Pseudonym is required" },
        { status: 400 }
      );
    }

    // Set pseudonym for all user's predictions
    await setPseudonym(user.id, pseudonym);

    return NextResponse.json({
      success: true,
      pseudonym: pseudonym.trim(),
    });
  } catch (error) {
    console.error("[Set Pseudonym API] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("already set")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes("already taken")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes("between 2 and 30")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to set pseudonym" },
      { status: 500 }
    );
  }
}
