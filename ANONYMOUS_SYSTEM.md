# Anonymous User System - Implementation Details

## Overview

ProofLocker uses a **zero-friction anonymous user system** that requires no authentication, sign-up, or login. Users are automatically assigned persistent identities that work across sessions.

## How It Works

### 1. User ID Generation

When a user first visits ProofLocker:
1. System checks localStorage for existing user ID
2. If none exists, generates a UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
3. Stores UUID in `localStorage` under key `prooflocker-user-id`
4. Also stores user type as `"anonymous"` under key `prooflocker-user-type`

### 2. Persistence

- UUID persists across browser sessions on the same device
- No server-side tracking required
- Users maintain same identity until they clear browser data
- Works offline (except for blockchain submission)

### 3. Privacy Guarantees

**What's stored locally:**
- Anonymous UUID
- User type indicator
- Full text of predictions (for display)

**What's stored off-chain (server):**
- Prediction metadata with anonymous userId
- Text preview (first 200 chars)
- Timestamp
- SHA-256 hash

**What's stored on-chain (Constellation Network):**
- SHA-256 hash only
- No user identifiers
- No personal information

## Code Structure

### `/src/lib/user.ts`

Main utility for user management:

```typescript
getOrCreateUserId()      // Get existing or create new UUID
getUserType()            // Returns "anonymous" or "authenticated"
isAnonymousUser()        // Check if user is anonymous
linkToAccount(accountId) // Future: Link to authenticated account
clearUserData()          // Clear user data (testing/logout)
```

### UUID Generation

```typescript
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

Valid UUID v4 with proper random distribution.

## User Experience

### Visual Indicators

**Homepage Footer:**
```
"No login required — proofs live on-chain" badge
```

**Lock Prediction Page:**
```
"✓ You're using ProofLocker anonymously"
```

These messages:
- Reinforce zero-friction UX
- Build trust through transparency
- Educate users about privacy model

### "My Predictions" Feature

- Filters predictions by current user's UUID
- Shows only predictions created by this device/browser
- Seamlessly switches between "All" and "My" tabs
- No authentication required

## Future-Proof Design

### Account Linking (Future Feature)

When users want to upgrade to an account:

1. User creates account with email/password or OAuth
2. System calls `linkToAccount(newAccountId)`
3. Predictions are migrated using `migratePredictions()`
4. UUID remains in localStorage for audit trail
5. New predictions use authenticated account ID

### Migration Example

```typescript
// User creates account
const authenticatedUserId = "auth_123456";

// Link anonymous predictions to account
await linkToAccount(authenticatedUserId);

// Backend migrates all predictions
await migratePredictions(anonymousUserId, authenticatedUserId);
```

### Data Structure Support

```typescript
interface Prediction {
  userId: string;        // Works for both anonymous and authenticated
  // Future fields:
  accountId?: string;    // Set when linked to account
  migratedFrom?: string; // Original anonymous UUID
}
```

## Benefits

### For Users
- ✅ Zero friction - start immediately
- ✅ No email required
- ✅ No password to remember
- ✅ Private by default
- ✅ Can upgrade to account later without losing data

### For Product
- ✅ Higher conversion - no sign-up barrier
- ✅ Better sharing - proofs are public by default
- ✅ Viral potential - easy to try and share
- ✅ Privacy-respecting - minimal data collection
- ✅ Future-proof - designed for account system

### For Credibility
- ✅ Blockchain-backed proofs
- ✅ Immutable timestamps
- ✅ Public verification
- ✅ No central authority needed

## Security Considerations

### What This System Protects Against
- ✅ Data leaks (minimal data stored)
- ✅ Account takeovers (no accounts to take over)
- ✅ Password breaches (no passwords)
- ✅ Phishing (nothing to phish)

### What Users Should Know
- ⚠️ Clearing browser data = losing predictions access
- ⚠️ Different devices = different anonymous identities
- ⚠️ No recovery mechanism (by design for anonymity)
- ℹ️ Can export/save important predictions manually

## Comparison to Other Systems

### Traditional (Email + Password)
- ❌ High friction
- ❌ Barriers to entry
- ❌ Password management burden
- ❌ Email verification delays

### Social Login (OAuth)
- ❌ Privacy concerns
- ❌ Requires trust in third party
- ❌ Account linking complexity
- ⚠️ Still has friction

### ProofLocker (Anonymous-First)
- ✅ Zero friction
- ✅ Privacy by default
- ✅ Instant access
- ✅ Blockchain-backed credibility
- ✅ Optional upgrade path

## Implementation Checklist

- [x] UUID v4 generation
- [x] localStorage persistence
- [x] User type tracking
- [x] "My predictions" filtering
- [x] Visual indicators (badges)
- [x] Future-proof data structures
- [x] Migration functions (placeholder)
- [x] Documentation

## Testing the System

### Manual Test Flow

1. Open ProofLocker in browser
2. Check localStorage - should see `prooflocker-user-id`
3. Create a prediction
4. Switch to "My predictions" tab - should see your prediction
5. Open new incognito window - different anonymous user
6. Create prediction in incognito - won't see in "My predictions" of first tab
7. Verify prediction works from both contexts

### Developer Tools

```javascript
// Check current user ID
localStorage.getItem('prooflocker-user-id');

// Check user type
localStorage.getItem('prooflocker-user-type');

// Clear and start fresh
localStorage.removeItem('prooflocker-user-id');
localStorage.removeItem('prooflocker-user-type');
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Anonymous UUID generation
- ✅ localStorage persistence
- ✅ Prediction filtering

### Phase 2 (Optional)
- [ ] Account creation (email or OAuth)
- [ ] Prediction migration from anonymous to authenticated
- [ ] Multi-device sync
- [ ] Prediction export/backup

### Phase 3 (Advanced)
- [ ] Decentralized identity (ENS, Unstoppable Domains)
- [ ] Wallet-based authentication (MetaMask)
- [ ] Cross-chain verification
- [ ] NFT-based proof certificates

---

**Key Principle**: Maximize ease of use while preserving credibility and proof integrity.
