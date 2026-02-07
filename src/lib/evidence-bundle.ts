/**
 * Evidence Bundle Types
 *
 * Enhanced evidence system with support for OSINT linkage and chain of custody.
 */

export type EvidenceTier = 'unverified' | 'basic' | 'solid' | 'strong';
export type EvidenceItemType = 'link' | 'screenshot' | 'file' | 'osint_reference';
export type DomainQuality = 'reputable' | 'social' | 'unknown';

/**
 * Evidence Bundle - Collection of evidence items for a claim
 */
export interface EvidenceBundle {
  id: string;
  predictionId: string;
  createdAt: string;

  // Chain of custody
  submittedBy: string;      // user_id or anon_id
  bundleHash?: string;      // SHA-256 of canonical bundle

  // Computed scores
  evidenceScore?: number;   // 0-100
  evidenceTier?: EvidenceTier;

  // On-chain commitment
  deReference?: string;
  deStatus?: string;
  deSubmittedAt?: string;

  // Evidence items
  items: EvidenceItem[];
}

/**
 * Individual evidence item within a bundle
 */
export interface EvidenceItem {
  id: string;
  bundleId: string;
  itemOrder: number;
  createdAt: string;

  // Item type
  itemType: EvidenceItemType;

  // Content
  url?: string;
  title?: string;
  description?: string;

  // File storage
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileMime?: string;

  // Quality scoring
  domainQuality?: DomainQuality;

  // OSINT linkage
  osintSignalId?: string;   // Links to OSINT as evidence
}

/**
 * Database row formats (snake_case)
 */
export interface EvidenceBundleRow {
  id: string;
  prediction_id: string;
  created_at: string;
  submitted_by: string;
  bundle_hash?: string;
  evidence_score?: number;
  evidence_tier?: EvidenceTier;
  de_reference?: string;
  de_status?: string;
  de_submitted_at?: string;
}

export interface EvidenceItemRow {
  id: string;
  bundle_id: string;
  item_order: number;
  created_at: string;
  item_type: EvidenceItemType;
  url?: string;
  title?: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_mime?: string;
  domain_quality?: DomainQuality;
  osint_signal_id?: string;
}

/**
 * Convert database rows to domain objects
 */
export function mapEvidenceBundleFromDb(
  bundleRow: EvidenceBundleRow,
  itemRows: EvidenceItemRow[]
): EvidenceBundle {
  return {
    id: bundleRow.id,
    predictionId: bundleRow.prediction_id,
    createdAt: bundleRow.created_at,
    submittedBy: bundleRow.submitted_by,
    bundleHash: bundleRow.bundle_hash,
    evidenceScore: bundleRow.evidence_score,
    evidenceTier: bundleRow.evidence_tier,
    deReference: bundleRow.de_reference,
    deStatus: bundleRow.de_status,
    deSubmittedAt: bundleRow.de_submitted_at,
    items: itemRows
      .sort((a, b) => a.item_order - b.item_order)
      .map(mapEvidenceItemFromDb),
  };
}

export function mapEvidenceItemFromDb(row: EvidenceItemRow): EvidenceItem {
  return {
    id: row.id,
    bundleId: row.bundle_id,
    itemOrder: row.item_order,
    createdAt: row.created_at,
    itemType: row.item_type,
    url: row.url,
    title: row.title,
    description: row.description,
    filePath: row.file_path,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileMime: row.file_mime,
    domainQuality: row.domain_quality,
    osintSignalId: row.osint_signal_id,
  };
}

/**
 * Compute evidence score from items
 */
export function computeEvidenceScore(items: EvidenceItem[]): number {
  if (items.length === 0) return 0;

  let score = 0;

  // Base score for having evidence
  score += Math.min(items.length * 20, 60);

  // Quality bonuses
  for (const item of items) {
    if (item.domainQuality === 'reputable') {
      score += 10;
    } else if (item.domainQuality === 'social') {
      score += 5;
    }

    if (item.itemType === 'screenshot' || item.itemType === 'file') {
      score += 5;
    }

    if (item.osintSignalId) {
      score += 10; // Bonus for linking to OSINT
    }
  }

  return Math.min(score, 100);
}

/**
 * Get evidence tier from score
 */
export function getEvidenceTier(score: number): EvidenceTier {
  if (score >= 76) return 'strong';
  if (score >= 51) return 'solid';
  if (score >= 26) return 'basic';
  return 'unverified';
}
