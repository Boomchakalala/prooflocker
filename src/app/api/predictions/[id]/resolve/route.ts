import { NextRequest, NextResponse } from "next/server";
import { updatePredictionOutcome, type PredictionOutcome } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import type { EvidenceGrade, EvidenceItemInput } from "@/lib/evidence-types";
import { validateEvidenceRequirements } from "@/lib/evidence-types";
import {
  createEvidenceLinkItem,
  createEvidenceFileItem,
  uploadEvidenceFile,
  updateUserStats,
} from "@/lib/evidence-storage";
import { computeResolutionFingerprint } from "@/lib/evidence-hashing";
import { computeEvidenceScore } from "@/lib/evidence-scoring";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      outcome,
      resolutionNote,
      resolutionUrl,
      evidenceGrade,
      evidenceSummary,
      evidenceItems,
    }: {
      outcome: PredictionOutcome;
      resolutionNote?: string;
      resolutionUrl?: string;
      evidenceGrade: EvidenceGrade;
      evidenceSummary?: string;
      evidenceItems: Array<EvidenceItemInput & { hash?: string }>;
    } = body;

    // Validate outcome
    if (!outcome || !["correct", "incorrect", "invalid"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome value" },
        { status: 400 }
      );
    }

    // Validate evidence grade
    if (!evidenceGrade || !["A", "B", "C", "D"].includes(evidenceGrade)) {
      return NextResponse.json(
        { error: "Invalid evidence grade" },
        { status: 400 }
      );
    }

    // Validate evidence requirements
    const validation = validateEvidenceRequirements(
      evidenceGrade,
      evidenceSummary,
      evidenceItems.length
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate resolution note length
    if (resolutionNote && resolutionNote.length > 280) {
      return NextResponse.json(
        { error: "Resolution note must be 280 characters or less" },
        { status: 400 }
      );
    }

    // Validate evidence summary length
    if (evidenceSummary && evidenceSummary.length > 280) {
      return NextResponse.json(
        { error: "Evidence summary must be 280 characters or less" },
        { status: 400 }
      );
    }

    // Step 1: Process evidence items (upload files, create records)
    const evidenceHashes: string[] = [];
    const createdEvidenceItems = [];

    for (const item of evidenceItems) {
      try {
        if (item.type === "link" && item.url) {
          // Create link evidence item
          const created = await createEvidenceLinkItem(
            id,
            item.url,
            item.title,
            item.sourceKind,
            item.notes
          );
          evidenceHashes.push(created.sha256);
          createdEvidenceItems.push(created);
        } else if (item.type === "file" && item.file) {
          // For file uploads, we need to handle this specially
          // Since we can't send File objects via JSON, the client should send file data differently
          // For now, we'll skip file upload in this endpoint and handle it separately
          // Or the client should upload files first and send URLs
          console.warn("[Resolve API] File upload not implemented in this endpoint");
        } else if (item.hash) {
          // If hash is provided, use it
          evidenceHashes.push(item.hash);
        }
      } catch (error) {
        console.error("[Resolve API] Error processing evidence item:", error);
        // Continue with other items
      }
    }

    // Step 2: Compute resolution fingerprint
    const resolutionFingerprint = await computeResolutionFingerprint({
      predictionId: id,
      outcome,
      resolvedAt: new Date().toISOString(),
      evidenceGrade,
      evidenceItemHashes: evidenceHashes,
      evidenceSummary: evidenceSummary || "",
    });

    // Step 3: Update prediction with resolution data
    await updatePredictionOutcome(
      id,
      outcome,
      user.id,
      resolutionNote,
      resolutionUrl,
      evidenceGrade,
      evidenceSummary,
      resolutionFingerprint
    );

    // Step 4: Update user stats
    try {
      await updateUserStats(user.id);
    } catch (error) {
      console.error("[Resolve API] Error updating user stats:", error);
      // Non-fatal, continue
    }

    return NextResponse.json({
      success: true,
      outcome,
      evidenceGrade,
      resolutionFingerprint,
      evidenceItemsCreated: createdEvidenceItems.length,
    });
  } catch (error) {
    console.error("[Resolve API] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Prediction not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("unclaimed")) {
        return NextResponse.json(
          { error: "Cannot resolve unclaimed prediction" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to resolve prediction" },
      { status: 500 }
    );
  }
}
