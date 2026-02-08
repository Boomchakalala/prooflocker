# Evidence Grading System - Unified Documentation

## Overview
ProofLocker uses a **4-tier evidence grading system (A/B/C/D)** to evaluate the quality of evidence provided when resolving claims. This system is now consistent across all components and interfaces.

## The Grading System

### Grade A: Primary/Authoritative (80-100 points)
- **Multiplier:** 1.6x
- **Description:** Primary/authoritative sources
- **Examples:** Official documents, court records, on-chain transactions, government data
- **Color:** Emerald/Green
- **Score Range:** 80-100

### Grade B: High-Quality Secondary (60-79 points)
- **Multiplier:** 1.3x
- **Description:** High-quality secondary sources
- **Examples:** Reputable news outlets, multiple corroborating sources, verified reports
- **Color:** Cyan/Blue
- **Score Range:** 60-79

### Grade C: Weak/Indirect (30-59 points)
- **Multiplier:** 0.8x
- **Description:** Weak or indirect evidence
- **Examples:** Screenshots, single-source claims, social media posts
- **Color:** Amber/Yellow
- **Score Range:** 30-59

### Grade D: No Evidence (0-29 points)
- **Multiplier:** 0.3x
- **Description:** No supporting evidence
- **Examples:** Claims resolved without evidence
- **Color:** Gray/Slate
- **Score Range:** 0-29

## How Points Are Calculated

```
Final Score = Base Points × Evidence Grade Multiplier
```

**Example:**
- Correct claim (base: 100 pts) + Grade A evidence = 100 × 1.6 = 160 pts
- Correct claim (base: 100 pts) + Grade D evidence = 100 × 0.3 = 30 pts

## Implementation

### Central Utility
All components use the centralized grading system from:
```typescript
import { getEvidenceGrade, estimateSourceCount } from '@/lib/evidence-grading';
```

### Components Using This System
1. **WallOfWins.tsx** - Live claims feed with colored grade badges
2. **MomentOfTruth.tsx** - Before/After example showing "Grade A"
3. **UnifiedCard.tsx** - Individual claim cards
4. **Resolution modals** - When users submit evidence

### Visual Display
Each grade has consistent styling across the site:
- **Badge style:** Colored background + border + text
- **Hover tooltip:** Shows grade letter and description
- **Icon:** Shield/checkmark indicating evidence quality

## Where You'll See Grades

### 1. Claim Cards
Each claim shows its evidence grade as a colored badge:
```
[Shield Icon] A
```

### 2. Resolution Outcomes
When resolving a claim, users select a grade and provide matching evidence.

### 3. "The Moment of Truth" Section
Example shows progression from no evidence to Grade A evidence:
```
Evidence: 3 pieces (Grade A)
```

### 4. User Profiles
Shows distribution of evidence grades across all user's resolutions.

## Math Consistency

**Score-to-Grade Mapping:**
```typescript
if (score >= 80) return 'A';      // 80-100
if (score >= 60) return 'B';      // 60-79
if (score >= 30) return 'C';      // 30-59
return 'D';                        // 0-29
```

**Source Count Estimation:**
```typescript
sources = max(1, floor(score / 30))
```
- Score 90 → 3 sources
- Score 60 → 2 sources
- Score 30 → 1 source

## Design Principles

1. **Simple & Clear:** 4 tiers (A/B/C/D) are easy to understand
2. **Visual:** Color-coded for quick recognition
3. **Incentivized:** Higher grades = better multipliers
4. **Verifiable:** Each grade has clear requirements
5. **Consistent:** Same system everywhere on the site

## Migration Notes

Previously, some components used a 5-tier system (D/C/B/A/S). This has been unified to the documented 4-tier system (A/B/C/D) for consistency.

**Changed:**
- Removed "S" grade (legendary)
- Grade A now tops out at 80+ points (was 95+)
- All components now use `evidence-grading.ts` utility

## For Developers

When adding new features that display evidence:

1. Import the utility:
   ```typescript
   import { getEvidenceGrade } from '@/lib/evidence-grading';
   ```

2. Get grade info:
   ```typescript
   const grade = getEvidenceGrade(evidenceScore);
   ```

3. Display with consistent styling:
   ```tsx
   <div className={`${grade.bgColor} ${grade.borderColor}`}>
     Grade {grade.grade}: {grade.description}
   </div>
   ```

This ensures the entire site uses the same grading logic and visual treatment.
