import fs from "fs/promises";
import path from "path";

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
  confirmedAt?: string; // ISO timestamp when on-chain confirmation succeeded
  // Future fields for account linking:
  // accountId?: string;  // When anonymous user upgrades to account
  // migratedFrom?: string;  // Original anonymous userId if migrated
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "predictions.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readPredictions(): Promise<Prediction[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writePredictions(predictions: Prediction[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(predictions, null, 2));
}

export async function savePrediction(prediction: Prediction): Promise<void> {
  const predictions = await readPredictions();
  predictions.unshift(prediction); // Add to beginning for newest first
  await writePredictions(predictions);
}

export async function getAllPredictions(): Promise<Prediction[]> {
  return readPredictions();
}

export async function getPredictionsByUserId(
  userId: string
): Promise<Prediction[]> {
  const predictions = await readPredictions();
  return predictions.filter((p) => p.userId === userId);
}

export async function getPredictionById(id: string): Promise<Prediction | null> {
  const predictions = await readPredictions();
  return predictions.find((p) => p.id === id) || null;
}

export async function getPredictionByProofId(
  proofId: string
): Promise<Prediction | null> {
  const predictions = await readPredictions();
  return predictions.find((p) => p.proofId === proofId) || null;
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
