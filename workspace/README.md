# ProofLocker

**Lock your statements and predictions in time using Constellation Network**

ProofLocker is a Polymarket-style app that lets users create tamper-proof, timestamped predictions without requiring accounts or authentication. Your predictions are hashed and submitted to the Constellation Network ($DAG) blockchain, creating immutable proof that your statement existed at a specific time.

## Features

### Zero-Friction Anonymous System
- **No login required** - Start using ProofLocker immediately
- **Persistent identity** - Anonymous users are assigned a UUID stored in localStorage
- **"My predictions" view** - Filter to see only your predictions
- **Public feed** - All predictions are visible to everyone
- **Public verification** - Anyone can verify any proof

### Privacy & Security
- Only SHA-256 hashes are submitted on-chain
- Full text stored locally for display
- Digital Evidence via Constellation Network
- Verifiable timestamps

### User Experience
- Dark, modern UI inspired by Polymarket
- Card-based feed with clean spacing
- Inter font for readability, monospace for hashes
- Mobile responsive
- One-click hash copying and sharing

## How It Works

### Creating a Proof
1. Enter your statement or prediction
2. Click "Lock prediction"
3. Text is hashed using SHA-256
4. Hash is submitted to Constellation Network
5. Receive a unique Proof ID

### Verifying a Proof
1. Enter the Proof ID
2. Enter the original text
3. System re-hashes the text and compares
4. Shows verification result with timestamp

## Architecture

### Anonymous User System

Users are automatically assigned a persistent UUID stored in `localStorage`:
- No authentication barriers
- Works across sessions on the same device
- Future-proof for account upgrades

```typescript
// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// Example: 550e8400-e29b-41d4-a716-446655440000
```

### Data Storage

**Off-chain (local storage)**
- Prediction metadata (userId, text, preview, timestamp)
- Stored in JSON file (`data/predictions.json`)
- Easily migrated to database (Supabase, PostgreSQL, etc.)

**On-chain (Constellation Network)**
- SHA-256 hash only
- DAG transaction ID
- Immutable proof of existence

### Future-Proof Account Linking

The system is designed to support future account upgrades:

```typescript
// When a user creates an account, predictions can be migrated
await migratePredictions(anonymousUserId, authenticatedUserId);
```

Predictions maintain their integrity while transferring ownership.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Fonts**: Inter (body), JetBrains Mono (code)
- **Storage**: JSON file (easily replaceable)
- **Blockchain**: Constellation Network (mocked, ready for real integration)

## Getting Started

### Development

```bash
# Install dependencies
bun install

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Considerations

1. **Replace file storage with a database**
   - Current: `data/predictions.json`
   - Recommended: Supabase, PostgreSQL, MongoDB

2. **Integrate real Constellation Network API**
   - Update `/src/app/api/lock-proof/route.ts`
   - Replace mock DAG submission with real SDK calls

3. **Add account system (optional)**
   - Use `linkToAccount()` from `/src/lib/user.ts`
   - Call `migratePredictions()` to transfer anonymous predictions

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage with feed and tabs
│   ├── lock/                 # Lock prediction page
│   ├── verify/               # Verify proof page
│   └── api/
│       ├── lock-proof/       # Create predictions
│       ├── verify-proof/     # Verify predictions
│       └── predictions/      # Fetch predictions feed
├── components/
│   └── PredictionCard.tsx    # Prediction card component
└── lib/
    ├── storage.ts            # Data persistence layer
    └── user.ts               # Anonymous user management
```

## Design Philosophy

### Anonymous-First
- Zero barriers to entry
- No email, password, or verification needed
- Privacy by default

### Polymarket-Inspired
- Dark theme (`#0a0a0a` background)
- Card-based layouts
- Subtle borders (`#1f1f1f`)
- Clean, modern aesthetics

### Blockchain-Backed
- Immutable proof of existence
- Verifiable timestamps
- Public verification
- Decentralized trust

## Contributing

When adding features, maintain these principles:
1. Keep anonymous access frictionless
2. Preserve data integrity and verifiability
3. Design for future account linking
4. Maintain Polymarket-style aesthetics

## License

MIT

---

**Powered by Constellation Network ($DAG)**
