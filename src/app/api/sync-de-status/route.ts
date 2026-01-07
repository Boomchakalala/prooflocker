import { NextRequest, NextResponse } from "next/server";
import { getPendingDEPredictions, updatePrediction } from "@/lib/storage";
import { checkDigitalEvidenceStatus, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";

export const runtime = "nodejs";

/**
 * POST /api/sync-de-status
 *
 * Syncs Digital Evidence status for pending predictions.
 * Fetches up to 20 predictions with non-confirmed DE status and checks their
 * current status from the DE API. Updates the database accordingly.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if DE is enabled
    if (!isDigitalEvidenceEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "Digital Evidence not configured",
          message: "Digital Evidence API keys are not configured. Cannot sync status.",
        },
        { status: 400 }
      );
    }

    console.log("[Sync DE Status] Starting sync...");

    // Get predictions that need status checking (max 20 for rate limiting)
    const pendingPredictions = await getPendingDEPredictions(20);

    console.log(`[Sync DE Status] Found ${pendingPredictions.length} predictions to check`);

    if (pendingPredictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No predictions to sync",
        checked: 0,
        updated: 0,
      });
    }

    let checkedCount = 0;
    let updatedCount = 0;
    const results = [];

    // Check each prediction's status
    for (const prediction of pendingPredictions) {
      try {
        console.log(`[Sync DE Status] Checking prediction ${prediction.id}...`);

        // Query DE API for status
        const statusResult = await checkDigitalEvidenceStatus({
          fingerprint: prediction.hash,
          eventId: prediction.deEventId,
        });

        checkedCount++;

        if (!statusResult.success) {
          console.warn(
            `[Sync DE Status] Failed to check status for ${prediction.id}:`,
            statusResult.error
          );
          results.push({
            id: prediction.id,
            proofId: prediction.proofId,
            success: false,
            error: statusResult.error,
          });
          continue;
        }

        const newStatus = statusResult.status || "PENDING";
        const oldStatus = prediction.deStatus || "PENDING";

        console.log(
          `[Sync DE Status] Prediction ${prediction.id}: ${oldStatus} -> ${newStatus}`
        );

        // Check if status changed
        if (newStatus !== oldStatus) {
          const updates: any = {
            de_status: newStatus,
          };

          // If status is now CONFIRMED, update app status and timestamp
          if (newStatus === "CONFIRMED" && prediction.onChainStatus !== "confirmed") {
            updates.status = "confirmed";
            updates.confirmed_at = statusResult.timestamp || new Date().toISOString();
            console.log(`[Sync DE Status] ✅ Marking ${prediction.id} as confirmed!`);
          }

          // Update the prediction in the database
          await updatePrediction(prediction.id, updates);

          updatedCount++;
          results.push({
            id: prediction.id,
            proofId: prediction.proofId,
            success: true,
            oldStatus,
            newStatus,
            confirmed: newStatus === "CONFIRMED",
          });
        } else {
          results.push({
            id: prediction.id,
            proofId: prediction.proofId,
            success: true,
            status: newStatus,
            unchanged: true,
          });
        }
      } catch (error) {
        console.error(`[Sync DE Status] Error processing ${prediction.id}:`, error);
        results.push({
          id: prediction.id,
          proofId: prediction.proofId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `[Sync DE Status] Complete - Checked: ${checkedCount}, Updated: ${updatedCount}`
    );

    return NextResponse.json({
      success: true,
      message: `Checked ${checkedCount} predictions, updated ${updatedCount}`,
      checked: checkedCount,
      updated: updatedCount,
      results,
    });
  } catch (error) {
    console.error("[Sync DE Status] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync DE status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
