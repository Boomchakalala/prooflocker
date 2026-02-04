# Evidence Scoring System - Implementation Complete

## What Was Implemented

### 1. Core Scoring Library (`src/lib/evidence-scoring.ts`)
- **Auto-calculated 0-100 score** with 4 tiers (Unverified/Basic/Solid/Strong)
- **Smart algorithm** with diminishing returns:
  - Evidence count: 1st=30pts, 2nd=+20pts, 3rd=+15pts, 4+=+5pts each
  - Item type bonuses: Screenshots +5pts, Files +8pts
  - Domain quality: Reputable domains +10pts, Social +5pts
  - Evidence summary: +10pts
  - Direct proof claim (optional): +15pts
- **Anti-gaming protections**: Caps, unique domain checks, visual evidence requirements
- **Transparent breakdown**: Shows exactly why each score was calculated

### 2. UI Component (`src/components/EvidenceScoreMeter.tsx`)
- **Compact variant**: Small badge for proof pages (shows tier + score)
- **Detailed variant**: Full meter with collapsible breakdown
- **Animated progress bar** with tier-based gradient colors
- **"Why this score?" toggle** showing point-by-point breakdown

### 3. Resolve Page Integration
- **Live score preview** appears as soon as user adds evidence
- **Updates in real-time** as items/summary added
- **Non-intrusive**: Only shows when evidence items exist
- **No redesign**: Added subtly to existing layout

### 4. Proof Page Integration
- **Replaced grade badge** with score meter in compact mode
- **Shows score + tier** next to outcome badge
- **Legacy support**: Maps old A/B/C/D grades to approximate scores

### 5. Backend Updates
- **Database schema**: Added `evidence_score`, `evidence_score_breakdown`, `direct_proof_claimed` columns
- **API route updated**: Computes score automatically on resolution
- **Storage function updated**: Saves score + breakdown to database

### 6. Migration SQL
- **Backfills scores** from legacy grades (A=85, B=70, C=40, D=10)
- **Creates index** for fast queries
- **Verification query** included

## How It Works

### For Users (Resolve Page):
1. User adds evidence items (links, screenshots, files)
2. Live score updates automatically
3. User can expand "Why this score?" to see breakdown
4. No manual grading needed - system calculates quality

### For Viewers (Proof Page):
1. See evidence quality at a glance (color-coded tier)
2. Compact badge shows "Strong · 87/100"
3. Builds trust through transparent scoring

### For the System:
1. Evidence score computed on resolution
2. Stored in database with full breakdown
3. Can be used for credibility calculations
4. Legacy grades still work (mapped to approximate scores)

## Files Changed

### Created:
- `src/lib/evidence-scoring.ts` - Core scoring algorithm
- `src/components/EvidenceScoreMeter.tsx` - UI component
- `supabase-evidence-scoring-migration.sql` - Database migration

### Modified:
- `src/app/resolve/[predictionId]/page.tsx` - Added live score preview
- `src/app/proof/[slug]/page.tsx` - Show score instead of grade badge
- `src/app/api/predictions/[id]/resolve/route.ts` - Compute & save score
- `src/lib/storage.ts` - Accept score parameters

## Next Steps

### 1. Run Database Migration:
```bash
# In Supabase Dashboard → SQL Editor:
# Copy and run: supabase-evidence-scoring-migration.sql
```

### 2. Test the Flow:
1. Resolve a prediction with 2-3 evidence links
2. Watch live score update
3. Click "Why this score?" to see breakdown
4. View proof page to see compact score badge

### 3. Optional Enhancements (Future):
- Add "Direct Proof" toggle checkbox on resolve page
- Show average evidence score on user profile
- Use score multiplier in credibility calculations
- A/B test tier thresholds based on user behavior

## Design Principles Maintained

✅ **Fun + Serious**: Meter feels game-like, but language is professional
✅ **Auto-scored**: No manual categorization required
✅ **Transparent**: Users see exactly why they got a score
✅ **Hard to game**: Multiple protections against spam/manipulation
✅ **Context-agnostic**: Works for trading, journalism, founders, etc.
✅ **No redesign**: Integrated into existing pages without disruption
✅ **Legacy compatible**: Old grades still work

The system is ready to use!
