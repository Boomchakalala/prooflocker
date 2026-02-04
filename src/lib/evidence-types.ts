/**
 * Evidence System Types
 *
 * Types for the evidence-based resolution system that adds
 * accountability and credibility scoring to ProofLocker.
 */

// Evidence grade enum
export type EvidenceGrade = "A" | "B" | "C" | "D";

// Evidence item type
export type EvidenceItemType = "link" | "file" | "screenshot";

// Evidence source classification
export type EvidenceSourceKind = "primary" | "secondary" | "social" | "onchain" | "dataset" | "other";

// Evidence item interface
export interface EvidenceItem {
  id: string;
  predictionId: string;
  type: EvidenceItemType;
  title?: string;
  url?: string; // Public URL for viewing
  filePath?: string; // Storage path (internal)
  mimeType?: string;
  fileSizeBytes?: number;
  sha256: string; // Required integrity hash
  sourceKind?: EvidenceSourceKind;
  notes?: string;
  createdAt: string;
}

// Evidence item for creation (before DB insert)
export interface EvidenceItemInput {
  type: EvidenceItemType;
  title?: string;
  url?: string;
  file?: File; // For file uploads
  sourceKind?: EvidenceSourceKind;
  notes?: string;
}

// Resolution with evidence
export interface ResolutionData {
  outcome: "correct" | "incorrect" | "invalid";
  evidenceGrade: EvidenceGrade;
  evidenceSummary?: string;
  resolutionNote?: string;
  resolutionUrl?: string;
  evidenceItems: EvidenceItemInput[];
}

// Resolution fingerprint payload (canonical format for hashing)
export interface ResolutionFingerprintPayload {
  predictionId: string;
  outcome: string;
  resolvedAt: string; // ISO timestamp
  evidenceGrade: EvidenceGrade;
  evidenceItemHashes: string[]; // Sorted SHA-256 hashes
  evidenceSummary: string;
}

// User statistics
export interface UserStats {
  userId: string;
  updatedAt: string;
  totalResolved: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalPartiallyCorrect: number;
  evidenceACount: number;
  evidenceBCount: number;
  evidenceCCount: number;
  evidenceDCount: number;
  accuracyRate: number; // 0-100
  credibilityScore: number;
  disputeCount?: number;
  disputeRate?: number;
}

// Evidence grade descriptions (for UI)
export const EvidenceGradeInfo: Record<EvidenceGrade, { label: string; description: string; color: string }> = {
  A: {
    label: "Grade A - Primary",
    description: "Official docs, court records, raw data, verified on-chain transactions",
    color: "emerald",
  },
  B: {
    label: "Grade B - Secondary",
    description: "Reputable outlets, multiple confirmations, high-quality secondary sources",
    color: "blue",
  },
  C: {
    label: "Grade C - Weak",
    description: "Screenshots, single-source, social media posts, indirect evidence",
    color: "amber",
  },
  D: {
    label: "Grade D - None",
    description: "No evidence provided. Minimal credibility impact.",
    color: "gray",
  },
};

// Scoring configuration
export const ScoringConfig = {
  basePoints: {
    correct: 10,
    incorrect: -10,
    invalid: -5,
    pending: 0,
  },
  evidenceMultipliers: {
    A: 1.6,
    B: 1.3,
    C: 0.8,
    D: 0.3,
  },
  accountabilityBonus: 2, // Bonus for resolving within deadline (if applicable)
};

// Evidence validation rules
export const EvidenceValidation = {
  evidenceSummary: {
    maxLength: 280,
    requiredForGrades: ["A", "B"] as EvidenceGrade[],
  },
  evidenceItems: {
    minCountForGrades: {
      A: 1,
      B: 1,
      C: 1,
      D: 0,
    } as Record<EvidenceGrade, number>,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
      "text/plain",
    ],
  },
};

// Calculate prediction score
export function calculatePredictionScore(
  outcome: string,
  evidenceGrade: EvidenceGrade
): number {
  const basePoints = ScoringConfig.basePoints[outcome as keyof typeof ScoringConfig.basePoints] || 0;
  const multiplier = ScoringConfig.evidenceMultipliers[evidenceGrade];

  // Apply multiplier only for correct outcomes
  if (outcome === "correct") {
    return Math.round(basePoints * multiplier);
  }

  return basePoints;
}

// Validate evidence requirements
export function validateEvidenceRequirements(
  grade: EvidenceGrade,
  evidenceSummary: string | undefined,
  evidenceItemCount: number
): { valid: boolean; error?: string } {
  // Check evidence summary requirement
  if (
    EvidenceValidation.evidenceSummary.requiredForGrades.includes(grade) &&
    (!evidenceSummary || evidenceSummary.trim().length === 0)
  ) {
    return {
      valid: false,
      error: `Evidence summary is required for Grade ${grade}`,
    };
  }

  // Check evidence summary length
  if (evidenceSummary && evidenceSummary.length > EvidenceValidation.evidenceSummary.maxLength) {
    return {
      valid: false,
      error: `Evidence summary must be ${EvidenceValidation.evidenceSummary.maxLength} characters or less`,
    };
  }

  // Check minimum evidence items
  const minItems = EvidenceValidation.evidenceItems.minCountForGrades[grade];
  if (evidenceItemCount < minItems) {
    return {
      valid: false,
      error: `Grade ${grade} requires at least ${minItems} evidence item${minItems > 1 ? "s" : ""}`,
    };
  }

  return { valid: true };
}
