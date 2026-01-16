# 🛡️ Production Safety Implementation - Action Plan

**Goal:** Make it impossible to accidentally break production.

**Status:** Ready to implement ✅

---

## Phase 1: Immediate Setup (30 minutes)

### Step 1: Create DEV Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `prooflocker-dev`
4. Choose same region as production
5. Wait for project to be created (~2 minutes)
6. Copy credentials:
   - URL: `https://[project-id].supabase.co`
   - Anon key: `eyJhbGc...`
   - Service role key: `eyJhbGc...` (Settings → API)

### Step 2: Setup DEV Database
1. In DEV Supabase → SQL Editor
2. Run the `COMPLETE-WORKING-SCHEMA-99953a1.sql` file
3. Verify tables created: `predictions` table exists
4. DEV database is now ready

### Step 3: Update Local Environment
```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local with DEV credentials
nano .env.local
```

**Fill in:**
```bash
APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[dev-service-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Configure Vercel Environment Variables

**Production Environment:**
```
Vercel → Your Project → Settings → Environment Variables
```

**Add/Update (Production ONLY):**
- `APP_ENV` = `production`
- `NEXT_PUBLIC_SUPABASE_URL` = [your PROD Supabase URL]
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [your PROD anon key]
- `SUPABASE_SERVICE_ROLE_KEY` = [your PROD service key]
- `NEXT_PUBLIC_SITE_URL` = `https://www.prooflocker.io`

**Add/Update (Preview + Development):**
- `APP_ENV` = `development`
- `NEXT_PUBLIC_SUPABASE_URL` = [your DEV Supabase URL]
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [your DEV anon key]
- `SUPABASE_SERVICE_ROLE_KEY` = [your DEV service key]
- `NEXT_PUBLIC_SITE_URL` = `https://dev.prooflocker.io`

---

## Phase 2: Code Changes (15 minutes)

### Files Already Created:
✅ `/src/lib/env.ts` - Environment utilities
✅ `/src/components/EnvIndicator.tsx` - Visual environment indicator
✅ `/src/lib/supabase.ts` - Updated with environment logging
✅ `.env.local.example` - Template for local development
✅ `PRODUCTION-SAFETY-GUIDE.md` - Complete guide
✅ `DEPLOYMENT-CHECKLIST.md` - Pre-deployment checklist

### Add Environment Indicator to Layout:

**Edit `/src/app/layout.tsx`:**
```typescript
import EnvIndicator from '@/components/EnvIndicator';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0a] text-white`}>
        {/* ... existing content ... */}
        {children}

        {/* Add this line: */}
        <EnvIndicator />
      </body>
    </html>
  );
}
```

**Test it:**
```bash
npm run dev
```
You should see a yellow badge in bottom-left corner saying "DEVELOPMENT"

---

## Phase 3: GitHub Branch Protection (10 minutes)

### Step 1: Create Development Branch
```bash
git checkout -b development
git push origin development
```

### Step 2: Protect Main Branch
1. GitHub → Repository → Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Do not allow bypassing the above settings
5. Save changes

### Step 3: Set Development as Default
1. GitHub → Settings → Branches
2. Default branch → Switch to `development`
3. Confirm

---

## Phase 4: Test the Workflow (10 minutes)

### Test 1: Local Development
```bash
# Start local dev
npm run dev

# Verify:
# - Yellow "DEVELOPMENT" badge shows
# - Console shows: [🟢 DEV] Supabase client initialized: [dev-project-id]
# - App connects to DEV database (no prod data visible)
```

### Test 2: Feature Branch → Development
```bash
# Create test feature
git checkout -b feature/test-workflow
echo "# Test" >> test.md
git add test.md
git commit -m "Test: workflow verification"
git push origin feature/test-workflow

# Create PR on GitHub (target: development)
# Verify Vercel creates preview deployment
# Test preview URL
# Merge PR
```

### Test 3: Development → Main (Production)
```bash
# Create release PR
gh pr create --base main --head development \
  --title "Test: Production deployment" \
  --body "Testing production workflow"

# Review PR carefully
# Merge to main
# Verify production deployment
```

---

## Phase 5: Verification (5 minutes)

### Verify Local Development:
- [ ] Yellow DEV badge visible in bottom-left
- [ ] Console shows `[🟢 DEV] Supabase client initialized`
- [ ] Can create/view predictions in DEV database
- [ ] Production data NOT visible locally

### Verify Preview Deployments:
- [ ] Feature branches get preview URLs
- [ ] Preview uses DEV Supabase (check console logs)
- [ ] Preview shows DEV badge

### Verify Production:
- [ ] Production at www.prooflocker.io
- [ ] NO environment badge visible
- [ ] Console shows `[🔴 PROD] Supabase client initialized`
- [ ] Uses PROD Supabase database
- [ ] All features work correctly

---

## Quick Start Commands

```bash
# Daily workflow
git checkout development
git pull origin development
git checkout -b feature/my-new-feature

# Make changes...

git add .
git commit -m "Add: new feature"
git push origin feature/my-new-feature

# Create PR on GitHub targeting 'development'
# Test preview deployment
# Merge to development

# When ready for production:
# Create PR from development → main
# Review carefully
# Merge to deploy
```

---

## Safety Features Now Active

✅ **Cannot push directly to main** - GitHub blocks it
✅ **Preview deployments** - Test before production
✅ **Environment separation** - DEV and PROD databases
✅ **Visual indicators** - Know which environment you're in
✅ **Console logging** - See which Supabase project is active
✅ **Rollback capability** - Revert bad deployments quickly
✅ **Deployment checklist** - Structured review process

---

## What Changed for You

### Before:
- ❌ One button to production (dangerous)
- ❌ One database for everything
- ❌ No safety checks
- ❌ Easy to break production

### After:
- ✅ Must create PR to deploy
- ✅ Separate DEV and PROD databases
- ✅ Environment guards and indicators
- ✅ Preview deployments for testing
- ✅ Nearly impossible to break production accidentally

---

## Next Steps

1. **Now:** Complete Phase 1 (Supabase DEV project)
2. **Now:** Complete Phase 2 (Code changes)
3. **Now:** Complete Phase 3 (GitHub protection)
4. **Now:** Complete Phase 4 (Test workflow)
5. **Daily:** Use the feature branch workflow
6. **Before Deploy:** Follow DEPLOYMENT-CHECKLIST.md
7. **Reference:** Keep PRODUCTION-SAFETY-GUIDE.md handy

---

## Questions?

**Q: Can I still deploy quickly in an emergency?**
A: Yes! Create a hotfix branch, push, create PR to main, merge. ~3 minutes.

**Q: What if I need to test something in production?**
A: Don't. Use preview deployments that connect to DEV database.

**Q: How do I know which environment I'm in?**
A: Look for the yellow DEV badge. If you don't see it, you're in production.

**Q: Can I still make quick fixes?**
A: Yes, but they go through the PR workflow. It's fast and safe.

**Q: What if GitHub is down?**
A: You can temporarily disable branch protection in Settings → Branches.

---

## Success Criteria

You'll know this is working when:
1. You can't accidentally push to main
2. You see the DEV badge locally
3. Preview deployments work automatically
4. You feel confident deploying

**Total setup time:** ~1 hour
**Long-term time saved:** Countless hours of panic and fixing production bugs

---

**Ready to implement? Start with Phase 1!**
