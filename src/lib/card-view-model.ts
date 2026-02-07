/**
 * CardViewModel - Unified Data Model for Prediction Cards
 *
 * This module normalizes different data sources (Predictions, Claims, OSINT)
 * into a unified shape so they can be rendered using the same PredictionCard component.
 *
 * This is the key to Globe <-> Feed symbiosis: both pages use the same card component
 * with data mapped through this layer.
 */

import type { Prediction } from './storage';
import {
  getReliabilityTier,
  getEvidenceGrade,
  calculateTrustScore,
  type ReliabilityTier,
  type EvidenceGrade,
} from './scoring';

// ============================================================================
// CARD VIEW MODEL TYPE
// ============================================================================

export type CardType = 'claim' | 'osint';

export type CardStatus = 'pending' | 'correct' | 'incorrect' | 'verified' | 'disputed' | 'void';

export interface CardViewModel {
  // Core identification
  id: string;
  type: CardType;

  // Display content
  title: string;
  textPreview: string;
  category?: string;

  // Timestamps
  createdAt: string;
  timestamp: string; // formatted for display
  resolvedAt?: string;

  // Author/Source
  authorId?: string;
  anonId?: string;
  authorNumber: number;
  authorName: string; // "Anon #1234" or source name for OSINT
  userId?: string | null;

  // Status
  status: CardStatus;
  outcome?: 'pending' | 'correct' | 'incorrect';
  onChainStatus?: string;

  // Location (for Globe)
  lat?: number;
  lng?: number;
  geotag?: string;

  // Evidence & Scoring
  evidence_score?: number; // 0-100
  evidenceGrade?: EvidenceGrade;
  author_reliability_tier?: ReliabilityTier;
  author_reliability_score?: number;

  // Verification metrics
  verifiedCount?: number;
  disputeCount?: number;
  upvotesCount?: number;
  userHasUpvoted?: boolean;

  // Computed scores (for sorting/filtering)
  trustScore: number;

  // Blockchain
  hash: string;
  publicSlug: string;

  // Additional metadata
  resolutionNote?: string;
  resolutionUrl?: string;
  tags?: string[];
  source?: string; // For OSINT - source name (e.g., "Conflict Radar")
  sourceHandle?: string; // For OSINT - Twitter handle (e.g., "@conflict_radar")
  sourceUrl?: string; // For OSINT - Link to source (e.g., Twitter URL)
  confidence?: number; // For Claims

  // Original data (for actions that need full object)
  _original: Prediction | any;
}

// ============================================================================
// MAPPERS
// ============================================================================

/**
 * Map a Prediction (user claim) to CardViewModel
 */
export function mapPredictionToCard(prediction: Prediction, currentUserId?: string | null): CardViewModel {
  const evidenceGrade = prediction.evidence_score
    ? getEvidenceGrade(prediction.evidence_score)
    : undefined;

  const trustScore = calculateTrustScore({
    evidenceScore: prediction.evidence_score,
    authorReliabilityScore: prediction.author_reliability_score,
    upvotesCount: prediction.upvotesCount || 0,
  });

  return {
    id: prediction.id,
    type: 'claim',

    title: prediction.textPreview,
    textPreview: prediction.textPreview,
    category: prediction.category,

    createdAt: prediction.createdAt,
    timestamp: prediction.timestamp,
    resolvedAt: prediction.resolvedAt,

    authorId: prediction.userId || prediction.anonId,
    anonId: prediction.anonId,
    authorNumber: prediction.authorNumber || 1000,
    authorName: `Anon #${prediction.authorNumber || 1000}`,
    userId: prediction.userId,

    status: prediction.outcome === 'correct'
      ? 'correct'
      : prediction.outcome === 'incorrect'
      ? 'incorrect'
      : 'pending',
    outcome: prediction.outcome,
    onChainStatus: prediction.onChainStatus || prediction.deStatus,

    lat: prediction.geotag_lat,
    lng: prediction.geotag_lng,
    geotag: prediction.geotag,

    evidence_score: prediction.evidence_score,
    evidenceGrade,
    author_reliability_tier: prediction.author_reliability_tier,
    author_reliability_score: prediction.author_reliability_score,

    upvotesCount: prediction.upvotesCount || 0,
    userHasUpvoted: false, // Will be fetched separately if needed

    trustScore,

    hash: prediction.hash,
    publicSlug: prediction.publicSlug,

    resolutionNote: prediction.resolutionNote,
    resolutionUrl: prediction.resolutionUrl,

    _original: prediction,
  };
}

/**
 * Map a Claim (from Globe API) to CardViewModel
 */
export function mapClaimToCard(claim: {
  id: number;
  claim: string;
  category?: string; // Category from database (Feed taxonomy)
  lat: number;
  lng: number;
  status: 'verified' | 'pending' | 'disputed' | 'void';
  submitter: string;
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
  [key: string]: any;
}): CardViewModel {
  // Map status
  const status: CardStatus =
    claim.status === 'verified'
      ? 'verified'
      : claim.status === 'disputed'
      ? 'disputed'
      : claim.status === 'void'
      ? 'void'
      : 'pending';

  // Infer evidence score from confidence
  const evidence_score = claim.confidence || 0;
  const evidenceGrade = getEvidenceGrade(evidence_score);

  // Infer reliability tier from rep
  const author_reliability_score = claim.rep || 0;
  const author_reliability_tier = getReliabilityTier(author_reliability_score);

  const trustScore = calculateTrustScore({
    evidenceScore: evidence_score,
    authorReliabilityScore: author_reliability_score,
  });

  // Generate a pseudo-hash for claims
  const hash = `claim_${claim.id}_${claim.lockedDate}`;
  const publicSlug = `claim-${claim.id}`;

  // Create a Prediction-like object for _original
  const predictionLike: Partial<Prediction> = {
    id: `claim-${claim.id}`,
    textPreview: claim.claim,
    category: claim.category || 'Other', // Use actual category from database, fallback to "Other"
    createdAt: claim.lockedDate,
    timestamp: claim.lockedDate,
    hash,
    publicSlug,
    outcome: claim.outcome === 'correct' ? 'correct' : claim.outcome === 'incorrect' ? 'incorrect' : 'pending',
    authorNumber: claim.id % 10000,
    anonId: `claim-submitter-${claim.id}`,
    userId: null,
    evidence_score,
    author_reliability_tier,
    author_reliability_score,
    geotag_lat: claim.lat,
    geotag_lng: claim.lng,
    upvotesCount: 0,
  };

  return {
    id: `claim-${claim.id}`,
    type: 'claim',

    title: claim.claim,
    textPreview: claim.claim,
    category: claim.category || 'Other', // Use actual category from database, fallback to "Other"

    createdAt: claim.lockedDate,
    timestamp: claim.lockedDate,

    authorId: `claim-submitter-${claim.id}`,
    anonId: `claim-submitter-${claim.id}`,
    authorNumber: claim.id % 10000,
    authorName: claim.submitter,

    status,
    outcome: claim.outcome === 'correct' ? 'correct' : claim.outcome === 'incorrect' ? 'incorrect' : 'pending',

    lat: claim.lat,
    lng: claim.lng,

    evidence_score,
    evidenceGrade,
    author_reliability_tier,
    author_reliability_score,

    confidence: claim.confidence,

    trustScore,

    hash,
    publicSlug,

    _original: predictionLike as Prediction,
  };
}

/**
 * Map an OSINT item (from Globe API) to CardViewModel
 */
export function mapOsintToCard(osint: {
  id: number;
  title: string;
  source: string;
  handle?: string; // Twitter handle like "@conflict_radar"
  lat: number;
  lng: number;
  timestamp: string;
  createdAt?: string; // ISO timestamp
  tags: string[];
  [key: string]: any;
}): CardViewModel {
  // OSINT items don't have traditional evidence scores, but we can infer from tags/source
  const evidence_score = 50; // Default to "basic" tier
  const evidenceGrade = getEvidenceGrade(evidence_score);

  const trustScore = calculateTrustScore({
    evidenceScore: evidence_score,
  });

  // Generate a pseudo-hash for OSINT
  const hash = `osint_${osint.id}_${osint.createdAt || osint.timestamp}`;
  const publicSlug = `osint-${osint.id}`;

  // Use OSINT-specific tags as category (first tag), fallback to "INTELLIGENCE"
  const category = osint.tags && osint.tags.length > 0 ? osint.tags[0] : 'INTELLIGENCE';

  // Generate Twitter URL from handle
  const sourceUrl = osint.handle ? `https://twitter.com/${osint.handle.replace('@', '')}` : undefined;

  // Create a Prediction-like object for _original
  const predictionLike: Partial<Prediction> = {
    id: `osint-${osint.id}`,
    textPreview: osint.title,
    category: category, // Use OSINT tag as category
    createdAt: osint.createdAt || osint.timestamp,
    timestamp: osint.createdAt || osint.timestamp,
    hash,
    publicSlug,
    outcome: 'pending',
    authorNumber: osint.id % 10000,
    anonId: `osint-source-${osint.id}`,
    userId: null,
    evidence_score,
    geotag_lat: osint.lat,
    geotag_lng: osint.lng,
    upvotesCount: 0,
  };

  return {
    id: `osint-${osint.id}`,
    type: 'osint',

    title: osint.title,
    textPreview: osint.title,
    category: category, // Use OSINT tag as category, not hardcoded "OSINT"

    createdAt: osint.createdAt || osint.timestamp,
    timestamp: osint.createdAt || osint.timestamp,

    authorId: `osint-source-${osint.id}`,
    anonId: `osint-source-${osint.id}`,
    authorNumber: osint.id % 10000,
    authorName: osint.source, // Source name like "Conflict Radar"
    source: osint.source,
    sourceHandle: osint.handle, // Twitter handle like "@conflict_radar"
    sourceUrl: sourceUrl, // Link to Twitter profile

    status: 'pending',

    lat: osint.lat,
    lng: osint.lng,

    evidence_score,
    evidenceGrade,

    tags: osint.tags, // All OSINT tags

    trustScore,

    hash,
    publicSlug,

    _original: predictionLike as Prediction,
  };
}

// ============================================================================
// BATCH MAPPERS
// ============================================================================

/**
 * Map an array of predictions to cards
 */
export function mapPredictionsToCards(
  predictions: Prediction[],
  currentUserId?: string | null
): CardViewModel[] {
  return predictions.map((p) => mapPredictionToCard(p, currentUserId));
}

/**
 * Map mixed data sources to unified cards
 */
export function mapMixedToCards(params: {
  predictions?: Prediction[];
  claims?: any[];
  osint?: any[];
  currentUserId?: string | null;
}): CardViewModel[] {
  const { predictions = [], claims = [], osint = [], currentUserId } = params;

  const cards: CardViewModel[] = [];

  cards.push(...predictions.map((p) => mapPredictionToCard(p, currentUserId)));
  cards.push(...claims.map(mapClaimToCard));
  cards.push(...osint.map(mapOsintToCard));

  return cards;
}

// ============================================================================
// FILTERING & SORTING
// ============================================================================

/**
 * Sort cards by various criteria
 */
export function sortCards(
  cards: CardViewModel[],
  sortBy: 'new' | 'trust' | 'upvotes' | 'evidence'
): CardViewModel[] {
  const sorted = [...cards];

  switch (sortBy) {
    case 'new':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'trust':
      sorted.sort((a, b) => b.trustScore - a.trustScore);
      break;
    case 'upvotes':
      sorted.sort((a, b) => (b.upvotesCount || 0) - (a.upvotesCount || 0));
      break;
    case 'evidence':
      sorted.sort((a, b) => (b.evidence_score || 0) - (a.evidence_score || 0));
      break;
  }

  return sorted;
}

/**
 * Filter cards by various criteria
 */
export function filterCards(
  cards: CardViewModel[],
  filters: {
    category?: string;
    status?: CardStatus[];
    highEvidence?: boolean;
    resolved?: boolean;
    timeWindow?: '24h' | '7d' | '30d' | 'all';
  }
): CardViewModel[] {
  let filtered = cards;

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((c) => c.category === filters.category);
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((c) => filters.status!.includes(c.status));
  }

  // High evidence filter
  if (filters.highEvidence) {
    filtered = filtered.filter((c) => c.evidence_score && c.evidence_score >= 76);
  }

  // Resolved filter
  if (filters.resolved) {
    filtered = filtered.filter((c) => c.status === 'correct' || c.status === 'incorrect');
  }

  // Time window filter
  if (filters.timeWindow && filters.timeWindow !== 'all') {
    const now = Date.now();
    const windowMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[filters.timeWindow];

    if (windowMs) {
      filtered = filtered.filter((c) => {
        const cardTime = new Date(c.createdAt).getTime();
        return now - cardTime <= windowMs;
      });
    }
  }

  return filtered;
}
