import { NextRequest, NextResponse } from "next/server";
import { getPredictionBySlug } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const prediction = await getPredictionBySlug(slug);

    if (!prediction) {
      return NextResponse.json(
        { error: "Proof not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      prediction,
    });
  } catch (error) {
    console.error("[Proof API] Error fetching proof:", error);
    return NextResponse.json(
      { error: "Failed to fetch proof" },
      { status: 500 }
    );
  }
}
