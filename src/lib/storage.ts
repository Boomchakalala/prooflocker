import { supabase } from "./supabase";

/**
 * Prediction data structure
 *
 * Future-proof design:
 * - userId can be either anonymous UUID or authenticated account ID
 * - When users upgrade from anonymous to authenticated, predictions can be migrated
 * - Store both anonymous and authenticated user IDs for seamless transition
 */
export interface Prediction {
  id: string;
  userId: string; // UUID for anonymous users, account ID for authenticated users
  authorNumber: number; // Anonymous author identifier (e.g., 1234 for "Anon #1234")
  text: string;
  textPreview: string;
  hash: string;
  timestamp: string;
  dagTransaction: string;
  proofId: string;
  onChainStatus: "pending" | "confirmed"; // Track on-chain confirmation status
  // Digital Evidence metadata (when confirmed on-chain):
  deReference?: string; // Constellation Digital Evidence reference/transaction ID
  deEventId?: string; // Digital Evidence event ID
  deStatus?: string; // Digital Evidence API status (NEW, PENDING, CONFIRMED, etc.)
  deSubmittedAt?: string; // ISO timestamp when submitted to Digital Evidence
  confirmedAt?: string; // ISO timestamp when on-chain confirmation succeeded
  // Future fields for account linking:
  // accountId?: string;  // When anonymous user upgrades to account
  // migratedFrom?: string;  // Original anonymous userId if migrated
}

/**
 * Database row structure (snake_case)
 */
interface PredictionRow {
  id: string;
  user_id: string;
  author_number: number;
  text: string;
  text_preview: string;
  fingerprint: string;
  timestamp: string;
  dag_transaction: string;
  proof_id: string;
  status: "pending" | "confirmed";
  de_reference: string | null;
  de_event_id: string | null;
  confirmed_at: string | null;
  created_at: string;
}

/**
 * Convert database row to Prediction object
 */
function rowToPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    userId: row.user_id,
    authorNumber: row.author_number,
    text: row.text,
    textPreview: row.text_preview,
    hash: row.fingerprint,
    timestamp: row.timestamp,
    dagTransaction: row.dag_transaction,
    proofId: row.proof_id,
    onChainStatus: row.status,
    deReference: row.de_reference || undefined,
    deEventId: row.de_event_id || undefined,
    confirmedAt: row.confirmed_at || undefined,
  };
}

/**
 * Convert Prediction object to database row
 */
function predictionToRow(prediction: Prediction): Omit<PredictionRow, "created_at"> {
  return {
    id: prediction.id,
    user_id: prediction.userId,
    author_number: prediction.authorNumber,
    text: prediction.text,
    text_preview: prediction.textPreview,
    fingerprint: prediction.hash,
    timestamp: prediction.timestamp,
    dag_transaction: prediction.dagTransaction,
    proof_id: prediction.proofId,
    status: prediction.onChainStatus,
    de_reference: prediction.deReference || null,
    de_event_id: prediction.deEventId || null,
    confirmed_at: prediction.confirmedAt || null,
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

/**
 * Future function: Migrate predictions from anonymous user to authenticated account
 * This will be used when implementing account linking
 */
export async function migratePredictions(
  anonymousUserId: string,
  authenticatedUserId: string
): Promise<number> {
  const predictions = await readPredictions();
  let migratedCount = 0;

  const updatedPredictions = predictions.map((p) => {
    if (p.userId === anonymousUserId) {
      migratedCount++;
      return {
        ...p,
        userId: authenticatedUserId,
        // Store original anonymous ID for audit trail
        // migratedFrom: anonymousUserId,
      };
    }
    return p;
  });

  await writePredictions(updatedPredictions);
  return migratedCount;
}
