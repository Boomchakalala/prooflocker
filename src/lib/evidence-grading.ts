/**
 * Evidence Grading System - Consistent across all components
 *
 * This file defines the unified evidence grading system used throughout ProofLocker.
 * All components should use these functions to ensure consistency.
 */

export interface EvidenceGradeInfo {
  grade: 'A' | 'B' | 'C' | 'D';
  score: number;
  multiplier: number;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  shadowColor: string;
}

/**
 * Evidence grade thresholds and multipliers
 * Based on documented system in EVIDENCE-SYSTEM-IMPLEMENTATION.md
 */
export const EVIDENCE_GRADES = {
  A: {
    minScore: 80,
    maxScore: 100,
    multiplier: 1.6,
    description: 'Primary/authoritative',
    longDescription: 'Official docs, court records, on-chain transactions',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    shadowColor: 'shadow-emerald-500/30',
  },
  B: {
    minScore: 60,
    maxScore: 79,
    multiplier: 1.3,
    description: 'High-quality secondary',
    longDescription: 'Reputable outlets, multiple sources',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    shadowColor: 'shadow-cyan-500/30',
  },
  C: {
    minScore: 30,
    maxScore: 59,
    multiplier: 0.8,
    description: 'Weak/indirect',
    longDescription: 'Screenshots, single-source, social posts',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    shadowColor: 'shadow-amber-500/30',
  },
  D: {
    minScore: 0,
    maxScore: 29,
    multiplier: 0.3,
    description: 'No evidence',
    longDescription: 'No supporting evidence provided',
    bgColor: 'bg-slate-600/20',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400',
    shadowColor: 'shadow-slate-600/20',
  },
} as const;

/**
 * Get evidence grade information from a score
 * @param score Evidence score (0-100)
 * @returns Evidence grade info with colors and descriptions
 */
export function getEvidenceGrade(score?: number): EvidenceGradeInfo {
  const normalizedScore = score ?? 0;

  if (normalizedScore >= EVIDENCE_GRADES.A.minScore) {
    return {
      grade: 'A',
      score: normalizedScore,
      multiplier: EVIDENCE_GRADES.A.multiplier,
      description: EVIDENCE_GRADES.A.description,
      bgColor: EVIDENCE_GRADES.A.bgColor,
      borderColor: EVIDENCE_GRADES.A.borderColor,
      textColor: EVIDENCE_GRADES.A.textColor,
      shadowColor: EVIDENCE_GRADES.A.shadowColor,
    };
  } else if (normalizedScore >= EVIDENCE_GRADES.B.minScore) {
    return {
      grade: 'B',
      score: normalizedScore,
      multiplier: EVIDENCE_GRADES.B.multiplier,
      description: EVIDENCE_GRADES.B.description,
      bgColor: EVIDENCE_GRADES.B.bgColor,
      borderColor: EVIDENCE_GRADES.B.borderColor,
      textColor: EVIDENCE_GRADES.B.textColor,
      shadowColor: EVIDENCE_GRADES.B.shadowColor,
    };
  } else if (normalizedScore >= EVIDENCE_GRADES.C.minScore) {
    return {
      grade: 'C',
      score: normalizedScore,
      multiplier: EVIDENCE_GRADES.C.multiplier,
      description: EVIDENCE_GRADES.C.description,
      bgColor: EVIDENCE_GRADES.C.bgColor,
      borderColor: EVIDENCE_GRADES.C.borderColor,
      textColor: EVIDENCE_GRADES.C.textColor,
      shadowColor: EVIDENCE_GRADES.C.shadowColor,
    };
  } else {
    return {
      grade: 'D',
      score: normalizedScore,
      multiplier: EVIDENCE_GRADES.D.multiplier,
      description: EVIDENCE_GRADES.D.description,
      bgColor: EVIDENCE_GRADES.D.bgColor,
      borderColor: EVIDENCE_GRADES.D.borderColor,
      textColor: EVIDENCE_GRADES.D.textColor,
      shadowColor: EVIDENCE_GRADES.D.shadowColor,
    };
  }
}

/**
 * Get score range for a grade
 * @param grade Evidence grade (A/B/C/D)
 * @returns Min and max score for that grade
 */
export function getScoreRange(grade: 'A' | 'B' | 'C' | 'D'): { min: number; max: number } {
  const gradeInfo = EVIDENCE_GRADES[grade];
  return {
    min: gradeInfo.minScore,
    max: gradeInfo.maxScore,
  };
}

/**
 * Calculate estimated source count from evidence score
 * @param score Evidence score
 * @returns Estimated number of sources
 */
export function estimateSourceCount(score: number): number {
  if (score === 0) return 0;
  // Rough estimate: 30 points per source
  return Math.max(1, Math.floor(score / 30));
}
