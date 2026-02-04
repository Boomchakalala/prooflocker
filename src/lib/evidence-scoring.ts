/**
 * Evidence Scoring System
 *
 * Auto-calculates evidence quality score (0-100) based on:
 * - Number of evidence items (diminishing returns)
 * - Type of evidence (screenshots/files > links)
 * - Link domain quality (reputable > social > unknown)
 * - Evidence summary presence
 * - Optional direct proof claim
 */

export interface EvidenceScoreResult {
  score: number; // 0-100
  tier: 'unverified' | 'basic' | 'solid' | 'strong';
  breakdown: ScoreBreakdownItem[];
}

export interface ScoreBreakdownItem {
  icon: '✓' | '⚠' | '💡';
  text: string;
  points: number;
}

// Reputable domains that get quality bonus
const REPUTABLE_DOMAINS = [
  // News
  'nytimes.com', 'wsj.com', 'washingtonpost.com', 'reuters.com', 'apnews.com',
  'bbc.com', 'bbc.co.uk', 'theguardian.com', 'ft.com', 'economist.com',
  'bloomberg.com', 'cnbc.com', 'cnn.com', 'forbes.com',

  // Crypto/Tech
  'coindesk.com', 'cointelegraph.com', 'techcrunch.com', 'theverge.com',
  'arstechnica.com', 'wired.com',

  // Official
  '.gov', '.edu',
];

// Social media patterns (get smaller bonus)
const SOCIAL_PATTERNS = [
  /twitter\.com\/.*\/status\//,
  /x\.com\/.*\/status\//,
  /reddit\.com\/r\/.*\/comments\//,
  /linkedin\.com\/posts\//,
  /github\.com\/.*\/commit\//,
  /github\.com\/.*\/issues\//,
  /github\.com\/.*\/pull\//,
];

// Score tier thresholds
const TIER_THRESHOLDS = {
  strong: 76,
  solid: 51,
  basic: 26,
  unverified: 0,
};

export interface EvidenceItemForScoring {
  type: 'link' | 'screenshot' | 'file';
  url?: string;
  file?: File | { name: string };
}

/**
 * Get domain quality classification
 */
function getDomainQuality(url: string): 'reputable' | 'social' | 'unknown' {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Check reputable domains
    if (REPUTABLE_DOMAINS.some(domain => hostname.includes(domain))) {
      return 'reputable';
    }

    // Check social patterns
    if (SOCIAL_PATTERNS.some(pattern => pattern.test(url))) {
      return 'social';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Compute evidence score based on items, summary, and optional direct proof claim
 */
export function computeEvidenceScore(
  items: EvidenceItemForScoring[],
  summary?: string,
  directProofClaim?: boolean
): EvidenceScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let score = 0;

  // Signal 1: Item count (diminishing returns)
  const itemCount = items.length;
  if (itemCount > 0) {
    let countPoints = 0;
    if (itemCount >= 1) countPoints += 30; // 1st item
    if (itemCount >= 2) countPoints += 20; // 2nd item (total: 50)
    if (itemCount >= 3) countPoints += 15; // 3rd item (total: 65)
    if (itemCount >= 4) countPoints += Math.min((itemCount - 3) * 5, 15); // 4+ items (capped at +15 more = 80 total)

    score += countPoints;
    breakdown.push({
      icon: '✓',
      text: `${itemCount} evidence source${itemCount > 1 ? 's' : ''} added`,
      points: countPoints,
    });
  }

  // Signal 2: Item type bonuses
  const screenshots = items.filter(i => i.type === 'screenshot').length;
  const files = items.filter(i => i.type === 'file').length;

  if (screenshots > 0) {
    const screenshotPoints = screenshots * 5;
    score += screenshotPoints;
    breakdown.push({
      icon: '✓',
      text: `${screenshots} screenshot${screenshots > 1 ? 's' : ''} included`,
      points: screenshotPoints,
    });
  }

  if (files > 0) {
    const filePoints = files * 8;
    score += filePoints;
    breakdown.push({
      icon: '✓',
      text: `${files} file${files > 1 ? 's' : ''} attached`,
      points: filePoints,
    });
  }

  // Signal 3: Link domain quality (only count unique domains)
  const linkItems = items.filter(i => i.type === 'link' && i.url);
  const domainCounts = new Map<string, { quality: string; count: number }>();

  for (const item of linkItems) {
    if (!item.url) continue;

    const quality = getDomainQuality(item.url);
    const hostname = new URL(item.url).hostname;

    if (!domainCounts.has(hostname)) {
      domainCounts.set(hostname, { quality, count: 1 });
    }
  }

  let reputableCount = 0;
  let socialCount = 0;

  for (const [_, data] of domainCounts) {
    if (data.quality === 'reputable') reputableCount++;
    if (data.quality === 'social') socialCount++;
  }

  if (reputableCount > 0) {
    const reputablePoints = reputableCount * 10;
    score += reputablePoints;
    breakdown.push({
      icon: '✓',
      text: `${reputableCount} reputable source${reputableCount > 1 ? 's' : ''}`,
      points: reputablePoints,
    });
  }

  if (socialCount > 0) {
    const socialPoints = socialCount * 5;
    score += socialPoints;
    breakdown.push({
      icon: '✓',
      text: `${socialCount} verified social source${socialCount > 1 ? 's' : ''}`,
      points: socialPoints,
    });
  }

  // Signal 4: Evidence summary
  if (summary && summary.trim().length >= 50) {
    score += 10;
    breakdown.push({
      icon: '✓',
      text: 'Explanation provided',
      points: 10,
    });
  }

  // Signal 5: Direct proof claim (requires screenshot or file)
  const hasVisualEvidence = screenshots > 0 || files > 0;
  if (directProofClaim && hasVisualEvidence) {
    score += 15;
    breakdown.push({
      icon: '✓',
      text: 'Direct proof claimed',
      points: 15,
    });
  } else if (directProofClaim && !hasVisualEvidence) {
    // Ignore claim if no visual evidence
    breakdown.push({
      icon: '⚠',
      text: 'Direct proof requires screenshot or file',
      points: 0,
    });
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine tier
  let tier: EvidenceScoreResult['tier'] = 'unverified';
  if (score >= TIER_THRESHOLDS.strong) tier = 'strong';
  else if (score >= TIER_THRESHOLDS.solid) tier = 'solid';
  else if (score >= TIER_THRESHOLDS.basic) tier = 'basic';

  // Add tips if score is low
  if (score < TIER_THRESHOLDS.solid && !summary) {
    breakdown.push({
      icon: '💡',
      text: 'Add an explanation to boost credibility',
      points: 0,
    });
  }

  if (score < TIER_THRESHOLDS.strong && !hasVisualEvidence) {
    breakdown.push({
      icon: '💡',
      text: 'Add screenshots or files to reach Strong tier',
      points: 0,
    });
  }

  return { score, tier, breakdown };
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: EvidenceScoreResult['tier']) {
  const info = {
    unverified: {
      label: 'Unverified',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      barColor: 'bg-gradient-to-r from-red-500 to-orange-500',
    },
    basic: {
      label: 'Basic',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      barColor: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    },
    solid: {
      label: 'Solid',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      barColor: 'bg-gradient-to-r from-yellow-500 to-blue-500',
    },
    strong: {
      label: 'Strong',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      barColor: 'bg-gradient-to-r from-blue-500 to-green-500',
    },
  };

  return info[tier];
}

/**
 * Calculate evidence multiplier for credibility score
 */
export function getEvidenceMultiplier(score: number): number {
  // Range: 0.5x (score=0) to 1.5x (score=100)
  return (score / 100) + 0.5;
}

/**
 * Map legacy evidence grades to approximate scores
 */
export const LEGACY_GRADE_SCORES = {
  'A': 85,
  'B': 70,
  'C': 40,
  'D': 10,
} as const;
