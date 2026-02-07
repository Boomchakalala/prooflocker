# ProofLocker: Claims + OSINT Monitoring 2.0

## ✅ Core Concept (CORRECTED)

**The Flow:**
1. User makes CLAIM FIRST (before event)
2. Adds pre-event EVIDENCE (their research/analysis)  
3. Event happens
4. OSINT captures breaking news
5. User links OSINT as POST-EVENT evidence
6. Gets reputation boost for being EARLY

**"His word has weight" = Track record of accurate EARLY predictions**

---

## 🎯 Correct User Journey

**Example: Marseille Game Prediction**

```
8:00 PM - CLAIM LOCKED
"Marseille will win by 2+ goals"
Evidence: Team stats, injury reports
→ Timestamped on-chain

11:00 PM - EVENT HAPPENS  
OSINT Signal: "Marseille defeats Lyon 3-1" - BBC Sport

11:05 PM - USER ADDS EVIDENCE
Finds OSINT in feed → Clicks "Use as Evidence"
Links to their 8pm claim
Time gap: 3 hours EARLY ✓
→ Reputation boost!
```

---

## 📦 Implementation Status

### ✅ SOLID BACKBONE (Complete)

**Database:**
- osint_signals table (news/events)
- evidence_bundles + evidence_items tables
- All indexed & optimized

**Backend:**
- OSINT storage & API
- Evidence scoring (0-100)
- Mock data working (6 signals)

**Frontend:**
- EvidenceBundleUploader ✓ (PERFECT - users add research when claiming)
- OSINT display with red styling ✓
- All/Claims/OSINT filter tabs ✓

### ✅ FLOW FIXED

**Before (WRONG):**
- Globe: "Create Claim from OSINT" ❌
- Lock form: OSINT prefill ❌

**After (CORRECT):**
- Globe: "Use as Evidence" ✓
- Lock form: Clean, no prefill ✓
- Evidence uploader for user's own research ✓

---

## 🔧 Next Steps (Build on Backbone)

### 1. Link OSINT → Existing Claims
Modal for "Use as Evidence":
- Show user's pending claims
- Select claim to link
- Calculate time gap
- Add reputation bonus

### 2. Time Gap Display
"Predicted 23 days before this news broke!"

### 3. Real OSINT APIs
Replace mock with Twitter, Reuters RSS

---

## 🎓 How Reputation Works

**Base:** Correct = +100, Wrong = -50

**Early Multiplier:**
- <24h before OSINT: 1.2x
- 1-7 days: 1.5x  
- 8-30 days: 2.0x
- 31-90 days: 3.0x
- 90+ days: 5.0x

**Evidence Bonus:**
- Strong (A): +50%
- Solid (B): +25%
- Basic (C): +10%

**Example:**
Claim 37 days early + Strong evidence = 525 pts!

---

## 🚀 Running Now

http://localhost:3000
- Feed with OSINT/Claims tabs ✓
- Globe monitoring view ✓
- Lock form with evidence uploader ✓
- Mock OSINT API serving data ✓

**Key Insight:** ProofLocker proves you were AHEAD of the news, not reacting to it. 🎯
