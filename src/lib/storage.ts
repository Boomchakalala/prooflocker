import fs from "fs/promises";
import path from "path";

export interface Prediction {
  id: string;
  userId: string;
  text: string;
  textPreview: string;
  hash: string;
  timestamp: string;
  dagTransaction: string;
  proofId: string;
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
