# Production Safety Guide

## Overview
This guide implements a production-safe workflow to prevent accidental breakage of the live app.

---

## 1. Environment Setup

### 1.1 Create Supabase DEV Project

**Go to Supabase Dashboard:**
1. Create a new project called `prooflocker-dev`
2. Note down the new credentials:
   - Project URL: `https://[project-id].supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (keep secret!)

**Copy Production Schema to DEV:**
1. In Production Supabase → SQL Editor
2. Run: `pg_dump` or use Supabase CLI to export schema
3. Import into DEV project

**Simpler approach (for now):**
- Run your `COMPLETE-WORKING-SCHEMA-99953a1.sql` in the DEV project
- DEV starts fresh with clean schema

---

## 2. Vercel Environment Variables

### 2.1 Configure Production Environment

**In Vercel Dashboard → Your Project → Settings → Environment Variables:**

**Add these for PRODUCTION ONLY:**
```
APP_ENV = production

NEXT_PUBLIC_SUPABASE_URL = https://[prod-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [prod-service-key]

NEXT_PUBLIC_SITE_URL = https://www.prooflocker.io
```

**Environment:** Select "Production" only

---

### 2.2 Configure Preview/Development Environment

**Add these for PREVIEW & DEVELOPMENT:**
```
APP_ENV = development

NEXT_PUBLIC_SUPABASE_URL = https://[dev-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [dev-service-key]

NEXT_PUBLIC_SITE_URL = https://dev.prooflocker.io
```

**Environment:** Select "Preview" and "Development"

---

### 2.3 Local Development (.env.local)

**Create `.env.local` (already gitignored):**
```bash
APP_ENV=development

NEXT_PUBLIC_SUPABASE_URL=https://[dev-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[dev-service-key]

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Never commit this file!** (It's in .gitignore)

---

## 3. Code Safety Guards

### 3.1 Environment Detection Utility

**Create `/src/lib/env.ts`:**
```typescript
/**
 * Environment detection and safety guards
 */

export const ENV = {
  isProduction: process.env.APP_ENV === 'production',
  isDevelopment: process.env.APP_ENV === 'development',
  appEnv: process.env.APP_ENV || 'development',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

/**
 * Guard function: throws error if action attempted in production
 */
export function guardProduction(action: string) {
  if (ENV.isProduction) {
    throw new Error(
      `🚨 BLOCKED: "${action}" is not allowed in production environment. ` +
      `Current APP_ENV: ${ENV.appEnv}`
    );
  }
}

/**
 * Console log with environment context
 */
export function logWithEnv(message: string, ...args: any[]) {
  console.log(`[${ENV.appEnv.toUpperCase()}] ${message}`, ...args);
}
```

---

### 3.2 Update Supabase Client

**Edit `/src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { ENV, logWithEnv } from './env';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Log which Supabase project is being used
logWithEnv('Connecting to Supabase:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### 3.3 Add Environment Indicator (Optional)

**Create `/src/components/EnvIndicator.tsx`:**
```typescript
'use client';

import { ENV } from '@/lib/env';

export default function EnvIndicator() {
  // Only show in non-production
  if (ENV.isProduction) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-lg shadow-lg">
      {ENV.appEnv.toUpperCase()} - {ENV.supabaseUrl.split('//')[1]?.split('.')[0]}
    </div>
  );
}
```

**Add to layout `/src/app/layout.tsx`:**
```typescript
import EnvIndicator from '@/components/EnvIndicator';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <EnvIndicator />
      </body>
    </html>
  );
}
```

---

## 4. GitHub Branch Protection

### 4.1 Enable Branch Protection for `main`

**GitHub → Repository → Settings → Branches → Add rule:**

**Branch name pattern:** `main`

**Enable these rules:**
- ✅ Require a pull request before merging
  - ✅ Require approvals: 0 (since you're solo, can be 0)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings (important!)
- ✅ Restrict who can push to matching branches
  - Add yourself as exception (so you can still merge PRs)

**Save changes**

---

### 4.2 Create Development Branch

```bash
git checkout -b development
git push origin development
```

**Set `development` as default branch in GitHub:**
- GitHub → Settings → Branches → Default branch → Switch to `development`

**Why?**
- All new PRs will target `development` by default
- `main` becomes production-only

---

## 5. Workflow: Making Changes

### 5.1 Feature Branch Workflow

```bash
# Start from development
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature X"

# Push to GitHub
git push origin feature/your-feature-name
```

### 5.2 Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. **Base:** `development` (not main!)
4. **Compare:** `feature/your-feature-name`
5. Review changes in PR
6. Vercel will automatically create a preview deployment
7. Test the preview URL
8. If good, merge PR into `development`

### 5.3 Deploy to Production

**Only when development is stable:**

```bash
# Create PR from development to main
git checkout development
git pull origin development

# Create release PR
gh pr create --base main --head development --title "Release: [date]" --body "Deploying stable changes to production"
```

**Or via GitHub UI:**
1. GitHub → Pull requests → New pull request
2. **Base:** `main`
3. **Compare:** `development`
4. Review all changes carefully
5. Get approval (or self-approve if solo)
6. **Merge to main** → Vercel deploys to production

---

## 6. Vercel Deployment Configuration

### 6.1 Configure Git Integration

**Vercel → Project Settings → Git:**

**Production Branch:** `main`
- ✅ Auto-deploy: ON
- Environment: Production

**Preview Branches:** `development`, `feature/*`
- ✅ Auto-deploy: ON
- Environment: Preview

---

## 7. Safety Checklist

### Before Making Changes:
- [ ] I'm working in a feature branch (not main)
- [ ] My `.env.local` points to DEV Supabase
- [ ] I see the DEV environment indicator in bottom-left

### Before Merging to Development:
- [ ] Code works locally
- [ ] No console errors
- [ ] Tested all changed features
- [ ] Created PR and got preview deployment
- [ ] Tested preview deployment URL

### Before Merging to Production (main):
- [ ] Development has been stable for at least 1 day
- [ ] No known bugs in development
- [ ] Tested preview deployment thoroughly
- [ ] Database schema in PROD matches what code expects
- [ ] Environment variables in Vercel are correct
- [ ] Created PR from development → main
- [ ] Reviewed all changes in PR carefully
- [ ] Have rollback plan (previous commit hash noted)

---

## 8. Rollback Procedure

**If production breaks:**

```bash
# Find last working commit
git log origin/main --oneline

# Create rollback branch from last working commit
git checkout -b hotfix/rollback [commit-hash]

# Push and create PR
git push origin hotfix/rollback
gh pr create --base main --head hotfix/rollback --title "HOTFIX: Rollback to [commit-hash]"

# Merge immediately to main → Vercel deploys
```

**Or via Vercel Dashboard:**
1. Vercel → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production

---

## 9. Verification Commands

### Check Current Environment:
```bash
# In terminal
echo $APP_ENV
echo $NEXT_PUBLIC_SUPABASE_URL

# In browser console (on running app)
console.log(window.location.origin) // should match NEXT_PUBLIC_SITE_URL
```

### Verify Supabase Connection:
```bash
# Check which project you're connected to
# Look at browser Network tab → any Supabase API call → Headers → URL
# Should contain your DEV project ID in development
```

---

## 10. Quick Reference

### Environments:
| Environment | Branch | Supabase | Vercel | URL |
|------------|--------|----------|--------|-----|
| Local Dev | any | DEV | n/a | localhost:3000 |
| Preview | feature/* | DEV | Preview | [branch]-prooflocker.vercel.app |
| Staging | development | DEV | Preview | development-prooflocker.vercel.app |
| Production | main | PROD | Production | www.prooflocker.io |

### Common Commands:
```bash
# Start local dev
npm run dev

# Check current branch
git branch --show-current

# Switch to development
git checkout development

# Update from remote
git pull origin development

# Create feature branch
git checkout -b feature/my-feature

# Check what will be merged
git diff development..feature/my-feature
```

---

## 11. Emergency Contacts

**If something breaks in production:**

1. **Immediate:** Rollback via Vercel Dashboard (90 seconds)
2. **Short-term:** Create hotfix PR from last working commit
3. **Long-term:** Fix in development, test thoroughly, then deploy

**Never:**
- ❌ Push directly to main
- ❌ Run SQL migrations on prod without testing in dev first
- ❌ Use prod credentials in local development
- ❌ Commit `.env.local` to git

---

## Summary

✅ **Two Supabase projects** (prod + dev)
✅ **Three branches** (main, development, feature/*)
✅ **Protected main branch** (no direct pushes)
✅ **Preview deployments** (test before prod)
✅ **Environment guards** (can't break prod accidentally)
✅ **Clear workflow** (feature → development → main)

**Result:** Production is safe. You can experiment freely in development without fear.
