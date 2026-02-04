/**
 * Evidence Storage Module
 *
 * Database operations for evidence items and user statistics
 */

import { supabase } from "./supabase";
import type { EvidenceItem, EvidenceGrade, UserStats } from "./evidence-types";
import { sha256Url, sha256FileServer } from "./evidence-hashing";

// Database row structure for evidence_items
interface EvidenceItemRow {
  id: string;
  created_at: string;
  prediction_id: string;
  type: string;
  title: string | null;
  url: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  sha256: string;
  source_kind: string | null;
  notes: string | null;
}

// Database row structure for user_stats
interface UserStatsRow {
  user_id: string;
  updated_at: string;
  total_resolved: number;
  total_correct: number;
  total_incorrect: number;
  total_partially_correct: number;
  evidence_a_count: number;
  evidence_b_count: number;
  evidence_c_count: number;
  evidence_d_count: number;
  accuracy_rate: number | null;
  credibility_score: number;
  dispute_count: number;
  dispute_rate: number | null;
}

/**
 * Convert database row to EvidenceItem
 */
function rowToEvidenceItem(row: EvidenceItemRow): EvidenceItem {
  return {
    id: row.id,
    predictionId: row.prediction_id,
    type: row.type as EvidenceItem["type"],
    title: row.title || undefined,
    url: row.url || undefined,
    filePath: row.file_path || undefined,
    mimeType: row.mime_type || undefined,
    fileSizeBytes: row.file_size_bytes || undefined,
    sha256: row.sha256,
    sourceKind: row.source_kind as EvidenceItem["sourceKind"] || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Convert database row to UserStats
 */
function rowToUserStats(row: UserStatsRow): UserStats {
  return {
    userId: row.user_id,
    updatedAt: row.updated_at,
    totalResolved: row.total_resolved,
    totalCorrect: row.total_correct,
    totalIncorrect: row.total_incorrect,
    totalPartiallyCorrect: row.total_partially_correct,
    evidenceACount: row.evidence_a_count,
    evidenceBCount: row.evidence_b_count,
    evidenceCCount: row.evidence_c_count,
    evidenceDCount: row.evidence_d_count,
    accuracyRate: row.accuracy_rate || 0,
    credibilityScore: row.credibility_score,
    disputeCount: row.dispute_count,
    disputeRate: row.dispute_rate || undefined,
  };
}

/**
 * Create a new evidence item (link type)
 */
export async function createEvidenceLinkItem(
  predictionId: string,
  url: string,
  title?: string,
  sourceKind?: string,
  notes?: string
): Promise<EvidenceItem> {
  // Compute hash of normalized URL
  const urlHash = await sha256Url(url);

  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      prediction_id: predictionId,
      type: "link",
      url,
      title: title || null,
      sha256: urlHash,
      source_kind: sourceKind || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[Evidence Storage] Error creating link evidence:", error);
    throw new Error(`Failed to create evidence item: ${error.message}`);
  }

  return rowToEvidenceItem(data);
}

/**
 * Create a new evidence item (file type)
 * Note: File must already be uploaded to storage
 */
export async function createEvidenceFileItem(
  predictionId: string,
  filePath: string,
  publicUrl: string,
  fileHash: string,
  mimeType: string,
  fileSizeBytes: number,
  title?: string,
  sourceKind?: string,
  notes?: string
): Promise<EvidenceItem> {
  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      prediction_id: predictionId,
      type: "file",
      url: publicUrl,
      file_path: filePath,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      sha256: fileHash,
      title: title || null,
      source_kind: sourceKind || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[Evidence Storage] Error creating file evidence:", error);
    throw new Error(`Failed to create evidence item: ${error.message}`);
  }

  return rowToEvidenceItem(data);
}

/**
 * Get all evidence items for a prediction
 */
export async function getEvidenceItemsByPrediction(
  predictionId: string
): Promise<EvidenceItem[]> {
  const { data, error } = await supabase
    .from("evidence_items")
    .select("*")
    .eq("prediction_id", predictionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Evidence Storage] Error fetching evidence items:", error);
    throw new Error(`Failed to fetch evidence items: ${error.message}`);
  }

  return (data || []).map(rowToEvidenceItem);
}

/**
 * Update user stats (calls the database function)
 */
export async function updateUserStats(userId: string): Promise<void> {
  const { error } = await supabase.rpc("update_user_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[Evidence Storage] Error updating user stats:", error);
    throw new Error(`Failed to update user stats: ${error.message}`);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No stats found, return null
      return null;
    }
    console.error("[Evidence Storage] Error fetching user stats:", error);
    throw new Error(`Failed to fetch user stats: ${error.message}`);
  }

  return rowToUserStats(data);
}

/**
 * Get leaderboard (top users by credibility score)
 */
export async function getLeaderboard(limit: number = 50): Promise<UserStats[]> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .order("credibility_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Evidence Storage] Error fetching leaderboard:", error);
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  return (data || []).map(rowToUserStats);
}

/**
 * Upload evidence file to Supabase Storage
 */
export async function uploadEvidenceFile(
  file: File,
  predictionId: string
): Promise<{ path: string; publicUrl: string }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `evidence/${predictionId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("evidence-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[Evidence Storage] Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("evidence-files")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
  };
}
