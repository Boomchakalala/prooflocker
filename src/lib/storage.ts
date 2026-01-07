import { supabase } from "./supabase";

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

export interface Prediction {
  id: string;
  userId?: string | null; // Supabase Auth user ID (null until claimed)
  anonId: string; // Anonymous identifier from localStorage
  authorNumber: number; // Anonymous author identifier (e.g., 1234 for "Anon #1234")
  text: string;
  textPreview: string;
  hash: string;
  timestamp: string;
  dagTransaction: string;
  proofId: string;
  publicSlug: string; // Unique slug for public proof page
  onChainStatus: "pending" | "confirmed"; // Track on-chain confirmation status
  outcome: PredictionOutcome; // Outcome: pending, correct, incorrect, invalid
  // Digital Evidence metadata (when confirmed on-chain):
  deReference?: string; // Constellation Digital Evidence reference/transaction ID
  deEventId?: string; // Digital Evidence event ID
  deStatus?: string; // Digital Evidence API status (NEW, PENDING, CONFIRMED, etc.)
  deSubmittedAt?: string; // ISO timestamp when submitted to Digital Evidence
  confirmedAt?: string; // ISO timestamp when on-chain confirmation succeeded
  claimedAt?: string; // ISO timestamp when claimed via email
}

/**
 * Database row structure (snake_case)
 */
interface PredictionRow {
  id: string;
  user_id: string | null;
  anon_id: string;
  author_number: number;
  text: string;
  text_preview: string;
  fingerprint: string;
  timestamp: string;
  dag_transaction: string;
  proof_id: string;
  public_slug: string;
  status: "pending" | "confirmed";
  outcome: string;
  de_reference: string | null;
  de_event_id: string | null;
  de_status: string | null;
  de_submitted_at: string | null;
  confirmed_at: string | null;
  claimed_at: string | null;
  created_at: string;
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
    text: row.text,
    textPreview: row.text_preview,
    hash: row.fingerprint,
    timestamp: row.timestamp,
    dagTransaction: row.dag_transaction,
    proofId: row.proof_id,
    publicSlug: row.public_slug,
    onChainStatus: row.status,
    outcome: row.outcome as PredictionOutcome,
    deReference: row.de_reference || undefined,
    deEventId: row.de_event_id || undefined,
    deStatus: row.de_status || undefined,
    deSubmittedAt: row.de_submitted_at || undefined,
    confirmedAt: row.confirmed_at || undefined,
    claimedAt: row.claimed_at || undefined,
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
    text: prediction.text,
    text_preview: prediction.textPreview,
    fingerprint: prediction.hash,
    timestamp: prediction.timestamp,
    dag_transaction: prediction.dagTransaction,
    proof_id: prediction.proofId,
    public_slug: prediction.publicSlug,
    status: prediction.onChainStatus,
    outcome: prediction.outcome,
    de_reference: prediction.deReference || null,
    de_event_id: prediction.deEventId || null,
    de_status: prediction.deStatus || null,
    de_submitted_at: prediction.deSubmittedAt || null,
    confirmed_at: prediction.confirmedAt || null,
    claimed_at: prediction.claimedAt || null,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Storage] Error fetching all predictions:", error);
    return [];
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
  userId: string
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

  // Update the outcome
  const { error } = await supabase
    .from("predictions")
    .update({ outcome })
    .eq("id", id);

  if (error) {
    console.error("[Storage] Error updating outcome:", error);
    throw new Error(`Failed to update outcome: ${error.message}`);
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
