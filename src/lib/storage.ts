import { supabase } from "./supabase";
import type { EvidenceGrade } from "./evidence-types";

/**
 * Prediction data structure
 *
 * Email-based claiming design:
 * - anonId stores the anonymous user identifier from localStorage
 * - userId is null until prediction is claimed via email
 * - When user claims via email, userId is set and claimedAt timestamp is recorded
 * - authorNumber derived from anonId for consistent anonymous display
 */
export type PredictionOutcome = "pending" | "correct" | "incorrect" | "invalid";
export type PredictionCategory = "Crypto" | "Politics" | "Markets" | "Tech" | "Sports" | "Culture" | "Personal" | "Other";

export interface Prediction {
  id: string;
  userId?: string | null; // Supabase Auth user ID (null until claimed)
  anonId: string; // Anonymous identifier from localStorage
  authorNumber: number; // Anonymous author identifier (e.g., 1234 for "Anon #1234")
  pseudonym?: string; // Optional immutable pseudonym (set once by owner)
  text: string;
  textPreview: string;
  hash: string;
  timestamp: string;
  dagTransaction: string;
  proofId: string;
  publicSlug: string; // Unique slug for public proof page
  onChainStatus: "pending" | "confirmed"; // Track on-chain confirmation status
  outcome: PredictionOutcome; // Outcome: pending, correct, incorrect, invalid
  category: PredictionCategory; // Category for organization and filtering
  // Resolution fields (user-controlled):
  resolutionNote?: string; // Optional note added when resolving (max 280 chars)
  resolutionUrl?: string; // Optional reference URL added when resolving
  resolvedAt?: string; // ISO timestamp when resolved by user
  resolvedBy?: string; // User ID who resolved
  // Evidence fields:
  evidenceGrade?: EvidenceGrade; // Evidence quality grade (A/B/C/D)
  evidenceSummary?: string; // Short explanation of evidence (max 280 chars)
  resolutionFingerprint?: string; // SHA-256 hash of resolution + evidence
  // Digital Evidence metadata (when prediction locked on-chain):
  deReference?: string; // Constellation Digital Evidence reference/transaction ID
  deEventId?: string; // Digital Evidence event ID
  deStatus?: string; // Digital Evidence API status (NEW, PENDING, CONFIRMED, etc.)
  deSubmittedAt?: string; // ISO timestamp when submitted to Digital Evidence
  confirmedAt?: string; // ISO timestamp when on-chain confirmation succeeded
  claimedAt?: string; // ISO timestamp when claimed via email
  // Resolution Digital Evidence metadata (when resolution locked on-chain):
  resolutionDeHash?: string; // Hash of resolution data submitted to Digital Evidence
  resolutionDeTimestamp?: string; // ISO timestamp when resolution was recorded on-chain
  resolutionDeReference?: string; // Digital Evidence reference/transaction ID for resolution
  resolutionDeEventId?: string; // Digital Evidence event ID for resolution
  resolutionDeStatus?: string; // Digital Evidence API status for resolution (PENDING, CONFIRMED, etc.)
  // Moderation fields:
  moderationStatus?: "active" | "hidden"; // Moderation status (active = visible, hidden = removed)
  hiddenReason?: string; // Reason for hiding (if hidden)
  hiddenAt?: string; // ISO timestamp when hidden
}

/**
 * Database row structure (snake_case)
 */
interface PredictionRow {
  id: string;
  user_id: string | null;
  anon_id: string;
  author_number: number;
  pseudonym: string | null;
  text: string;
  text_preview: string;
  fingerprint: string;
  timestamp: string;
  dag_transaction: string;
  proof_id: string;
  public_slug: string;
  status: "pending" | "confirmed";
  outcome: string;
  category: string;
  resolution_note: string | null;
  resolution_url: string | null;
  resolved_at: string | null;
  de_reference: string | null;
  de_event_id: string | null;
  de_status: string | null;
  de_submitted_at: string | null;
  confirmed_at: string | null;
  claimed_at: string | null;
  resolution_de_hash: string | null;
  resolution_de_timestamp: string | null;
  resolution_de_reference: string | null;
  resolution_de_event_id: string | null;
  resolution_de_status: string | null;
  created_at: string;
  moderation_status: "active" | "hidden";
  hidden_reason: string | null;
  hidden_at: string | null;
}

/**
 * Convert database row to Prediction object
 */
function rowToPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    anonId: row.anon_id,
    authorNumber: row.author_number,
    pseudonym: row.pseudonym || undefined,
    text: row.text,
    textPreview: row.text_preview,
    hash: row.fingerprint,
    timestamp: row.timestamp,
    dagTransaction: row.dag_transaction,
    proofId: row.proof_id,
    publicSlug: row.public_slug,
    onChainStatus: row.status,
    outcome: row.outcome as PredictionOutcome,
    category: row.category as PredictionCategory,
    resolutionNote: row.resolution_note || undefined,
    resolutionUrl: row.resolution_url || undefined,
    resolvedAt: row.resolved_at || undefined,
    deReference: row.de_reference || undefined,
    deEventId: row.de_event_id || undefined,
    deStatus: row.de_status || undefined,
    deSubmittedAt: row.de_submitted_at || undefined,
    confirmedAt: row.confirmed_at || undefined,
    claimedAt: row.claimed_at || undefined,
    resolutionDeHash: row.resolution_de_hash || undefined,
    resolutionDeTimestamp: row.resolution_de_timestamp || undefined,
    resolutionDeReference: row.resolution_de_reference || undefined,
    resolutionDeEventId: row.resolution_de_event_id || undefined,
    resolutionDeStatus: row.resolution_de_status || undefined,
    moderationStatus: row.moderation_status,
    hiddenReason: row.hidden_reason || undefined,
    hiddenAt: row.hidden_at || undefined,
  };
}

/**
 * Convert Prediction object to database row
 */
function predictionToRow(prediction: Prediction): Omit<PredictionRow, "created_at"> {
  return {
    id: prediction.id,
    user_id: prediction.userId || null,
    anon_id: prediction.anonId,
    author_number: prediction.authorNumber,
    pseudonym: prediction.pseudonym || null,
    text: prediction.text,
    text_preview: prediction.textPreview,
    fingerprint: prediction.hash,
    timestamp: prediction.timestamp,
    dag_transaction: prediction.dagTransaction,
    proof_id: prediction.proofId,
    public_slug: prediction.publicSlug,
    status: prediction.onChainStatus,
    outcome: prediction.outcome,
    category: prediction.category,
    resolution_note: prediction.resolutionNote || null,
    resolution_url: prediction.resolutionUrl || null,
    resolved_at: prediction.resolvedAt || null,
    de_reference: prediction.deReference || null,
    de_event_id: prediction.deEventId || null,
    de_status: prediction.deStatus || null,
    de_submitted_at: prediction.deSubmittedAt || null,
    confirmed_at: prediction.confirmedAt || null,
    claimed_at: prediction.claimedAt || null,
    resolution_de_hash: prediction.resolutionDeHash || null,
    resolution_de_timestamp: prediction.resolutionDeTimestamp || null,
    resolution_de_reference: prediction.resolutionDeReference || null,
    resolution_de_event_id: prediction.resolutionDeEventId || null,
    resolution_de_status: prediction.resolutionDeStatus || null,
    moderation_status: prediction.moderationStatus || "active",
    hidden_reason: prediction.hiddenReason || null,
    hidden_at: prediction.hiddenAt || null,
  };
}

export async function savePrediction(prediction: Prediction): Promise<void> {
  const row = predictionToRow(prediction);

  const { data, error } = await supabase
    .from("predictions")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("[Storage] Supabase insert error:", error);

    // Check for duplicate fingerprint (Postgres unique constraint violation)
    if (error.code === "23505" && error.message.includes("fingerprint")) {
      throw new Error("DUPLICATE_FINGERPRINT");
    }

    throw new Error(`Failed to save prediction: ${error.message}`);
  }
}

export async function getAllPredictions(): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("moderation_status", "active") // Only show active (non-hidden) predictions
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Storage] Error fetching all predictions:", error);

    // Fallback to cached production data for local testing
    try {
      const fs = require('fs');
      const cached = JSON.parse(fs.readFileSync('/tmp/predictions-cache.json', 'utf-8'));
      console.log(`[Storage] Using cached data: ${cached.predictions?.length || 0} predictions`);
      return cached.predictions || [];
    } catch (cacheError) {
      console.error("[Storage] Cache fallback failed:", cacheError);
      return [];
    }
  }

  return (data || []).map(rowToPrediction);
}

export async function getPredictionsByUserId(
  userId: string
): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Storage] Error fetching user predictions:", error);
    return [];
  }

  return (data || []).map(rowToPrediction);
}

export async function getPredictionsByAnonId(
  anonId: string
): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("anon_id", anonId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Storage] Error fetching anon predictions:", error);
    return [];
  }

  return (data || []).map(rowToPrediction);
}

export async function getPredictionById(id: string): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Storage] Error fetching prediction by id:", error);
    return null;
  }

  return data ? rowToPrediction(data) : null;
}

export async function getPredictionByProofId(
  proofId: string
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("proof_id", proofId)
    .single();

  if (error) {
    console.error("[Storage] Error fetching prediction by proofId:", error);
    return null;
  }

  return data ? rowToPrediction(data) : null;
}

export async function getPredictionBySlug(
  slug: string
): Promise<Prediction | null> {
  const { data, error} = await supabase
    .from("predictions")
    .select("*")
    .eq("public_slug", slug)
    .single();

  if (error) {
    console.error("[Storage] Error fetching prediction by slug:", error);
    return null;
  }

  return data ? rowToPrediction(data) : null;
}

/**
 * Update prediction fields (for DE status syncing)
 */
export async function updatePrediction(
  id: string,
  updates: Partial<Omit<PredictionRow, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase
    .from("predictions")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[Storage] Error updating prediction:", error);
    throw new Error(`Failed to update prediction: ${error.message}`);
  }
}

/**
 * Update prediction outcome (only for claimed predictions)
 */
export async function updatePredictionOutcome(
  id: string,
  outcome: PredictionOutcome,
  userId: string,
  resolutionNote?: string,
  resolutionUrl?: string
): Promise<void> {
  // First verify the user owns this prediction and it's claimed
  const { data: prediction, error: fetchError } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !prediction) {
    throw new Error("Prediction not found");
  }

  if (!prediction.user_id) {
    throw new Error("Cannot set outcome for unclaimed prediction");
  }

  if (prediction.user_id !== userId) {
    throw new Error("Unauthorized: You don't own this prediction");
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    outcome,
  };

  // If outcome is being set to resolved (correct or incorrect), save resolution data
  if (outcome === "correct" || outcome === "incorrect") {
    updateData.resolved_at = new Date().toISOString();
    if (resolutionNote) {
      updateData.resolution_note = resolutionNote;
    }
    if (resolutionUrl) {
      updateData.resolution_url = resolutionUrl;
    }
  } else {
    // If setting back to pending, clear resolution data
    updateData.resolved_at = null;
    updateData.resolution_note = null;
    updateData.resolution_url = null;
  }

  // Update the outcome and resolution data
  const { error } = await supabase
    .from("predictions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("[Storage] Error updating outcome:", error);
    throw new Error(`Failed to update outcome: ${error.message}`);
  }
}

/**
 * Set pseudonym for a user's predictions (immutable once set)
 */
export async function setPseudonym(
  userId: string,
  pseudonym: string
): Promise<void> {
  // Validate pseudonym format
  const trimmed = pseudonym.trim();
  if (trimmed.length < 2 || trimmed.length > 30) {
    throw new Error("Pseudonym must be between 2 and 30 characters");
  }

  // Check if user already has a pseudonym set
  const { data: existingPrediction, error: checkError } = await supabase
    .from("predictions")
    .select("pseudonym")
    .eq("user_id", userId)
    .not("pseudonym", "is", null)
    .limit(1)
    .single();

  if (!checkError && existingPrediction) {
    throw new Error("Pseudonym already set and cannot be changed");
  }

  // Check if pseudonym is already taken
  const { data: duplicateCheck, error: duplicateError } = await supabase
    .from("predictions")
    .select("id")
    .eq("pseudonym", trimmed)
    .limit(1)
    .single();

  if (!duplicateError && duplicateCheck) {
    throw new Error("This pseudonym is already taken");
  }

  // Update all user's predictions with the pseudonym
  const { error } = await supabase
    .from("predictions")
    .update({ pseudonym: trimmed })
    .eq("user_id", userId);

  if (error) {
    console.error("[Storage] Error setting pseudonym:", error);
    if (error.code === "23505") {
      throw new Error("This pseudonym is already taken");
    }
    throw new Error(`Failed to set pseudonym: ${error.message}`);
  }
}

/**
 * Get predictions with non-confirmed DE status (for syncing)
 */
export async function getPendingDEPredictions(limit: number = 20): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .not("de_status", "eq", "CONFIRMED")
    .not("de_event_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Storage] Error fetching pending DE predictions:", error);
    return [];
  }

  return (data || []).map(rowToPrediction);
}


/**
 * Claim predictions: Migrate predictions from anonymous user to authenticated account
 * This is used when a user logs in to claim their anonymous predictions
 */
export async function claimPredictions(
  anonId: string,
  authenticatedUserId: string
): Promise<number> {
  const { error } = await supabase
    .from("predictions")
    .update({
      user_id: authenticatedUserId,
      claimed_at: new Date().toISOString()
    })
    .eq("anon_id", anonId)
    .is("user_id", null); // Only claim unclaimed predictions

  if (error) {
    console.error("[Storage] Error claiming predictions:", error);
    throw new Error(`Failed to claim predictions: ${error.message}`);
  }

  // Count how many were claimed
  const { count } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authenticatedUserId)
    .eq("anon_id", anonId);

  return count || 0;
}

/**
 * Get all predictions for admin moderation (includes hidden ones)
 */
export async function getAllPredictionsForAdmin(): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Storage] Error fetching predictions for admin:", error);
    return [];
  }

  return (data || []).map(rowToPrediction);
}

/**
 * Hide a prediction (admin moderation)
 */
export async function hidePrediction(
  id: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("predictions")
    .update({
      moderation_status: "hidden",
      hidden_reason: reason,
      hidden_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[Storage] Error hiding prediction:", error);
    throw new Error(`Failed to hide prediction: ${error.message}`);
  }
}

/**
 * Unhide a prediction (admin moderation)
 */
export async function unhidePrediction(id: string): Promise<void> {
  const { error } = await supabase
    .from("predictions")
    .update({
      moderation_status: "active",
      hidden_reason: null,
      hidden_at: null,
    })
    .eq("id", id);

  if (error) {
    console.error("[Storage] Error unhiding prediction:", error);
    throw new Error(`Failed to unhide prediction: ${error.message}`);
  }
}
