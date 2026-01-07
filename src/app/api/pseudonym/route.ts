import { NextRequest, NextResponse } from "next/server";
import { setPseudonym } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
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
