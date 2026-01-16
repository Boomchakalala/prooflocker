# 🚀 Deployment Checklist

**Use this checklist before every deployment to production.**

---

## Pre-Deployment Checklist

### 1. Local Development
- [ ] I'm working in a feature branch (not `main`)
- [ ] `.env.local` points to DEV Supabase project
- [ ] I see the yellow DEV indicator in bottom-left corner
- [ ] All features work locally with no console errors
- [ ] Database queries work correctly

### 2. Code Quality
- [ ] No `console.log` debugging statements left in code
- [ ] No commented-out code blocks
- [ ] No TODO comments for critical issues
- [ ] TypeScript compiles with no errors: `npm run build`
- [ ] No ESLint errors: `npm run lint`

### 3. Testing
- [ ] Tested all changed features thoroughly
- [ ] Tested on mobile viewport (Chrome DevTools)
- [ ] Tested authentication flow (sign in/out)
- [ ] Tested prediction creation
- [ ] Tested prediction resolution
- [ ] Tested sharing functionality

### 4. Database
- [ ] Database schema in DEV matches code expectations
- [ ] Any new columns/tables documented
- [ ] Migration SQL ready for production (if schema changed)
- [ ] Tested migrations on DEV database first

### 5. Environment Variables
- [ ] All required env vars exist in Vercel
- [ ] Production uses PROD Supabase credentials
- [ ] Preview uses DEV Supabase credentials
- [ ] No secrets committed to git

### 6. Git Workflow
- [ ] Feature branch pushed to GitHub
- [ ] PR created targeting `development` branch
- [ ] Vercel preview deployment successful
- [ ] Preview deployment tested and working
- [ ] PR merged into `development`

### 7. Staging Review (Development Branch)
- [ ] Development branch is stable
- [ ] Development has been live for at least 2 hours (for critical changes)
- [ ] No known bugs in development environment
- [ ] All team members (if any) have tested

### 8. Production Deployment
- [ ] Created PR from `development` → `main`
- [ ] Reviewed ALL changes in the PR
- [ ] Noted current production commit hash for rollback: `git log origin/main -1`
- [ ] Production database schema is up to date
- [ ] Ready to monitor deployment in real-time

### 9. Post-Deployment Verification
- [ ] Visit https://www.prooflocker.io
- [ ] Homepage loads without errors
- [ ] Check browser console (F12) - no errors
- [ ] Test critical path: Sign in → Lock prediction → View in "My predictions"
- [ ] Test resolve functionality
- [ ] Test sharing functionality
- [ ] Monitor Vercel deployment logs for errors

### 10. Rollback Plan
- [ ] Previous commit hash noted: `________________`
- [ ] Know how to rollback via Vercel Dashboard (Deployments → ... → Promote)
- [ ] Know how to create emergency hotfix PR

---

## Emergency Rollback

**If something breaks in production:**

### Option 1: Vercel Dashboard (Fastest - 90 seconds)
1. Vercel → Your Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Confirm

### Option 2: Git Rollback
```bash
# Get last working commit from notes above
git checkout -b hotfix/rollback-to-[commit-hash]
git reset --hard [commit-hash]
git push origin hotfix/rollback-to-[commit-hash]

# Create PR to main
gh pr create --base main --head hotfix/rollback-to-[commit-hash] \
  --title "HOTFIX: Rollback to [commit-hash]" \
  --body "Emergency rollback due to production issue"

# Merge immediately
```

---

## Common Issues

### "Database query failed"
- **Check:** Is production using the correct Supabase project?
- **Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` in Vercel production env vars

### "Environment variables not working"
- **Check:** Did you set them for "Production" environment in Vercel?
- **Fix:** Vercel → Settings → Environment Variables → Check "Production" checkbox

### "Changes not appearing after deployment"
- **Check:** Did Vercel deployment succeed?
- **Fix:** Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

### "Preview deployment works but production doesn't"
- **Check:** Different env vars? Different Supabase project?
- **Fix:** Compare environment variables between Preview and Production

---

## Sign-off

**Before clicking "Merge Pull Request":**

I confirm:
- ✅ I have completed all items in this checklist
- ✅ I have tested the preview deployment
- ✅ I have noted the rollback commit hash
- ✅ I am ready to monitor the deployment

**Deployed by:** ___________________
**Date:** ___________________
**Commit:** ___________________
**Notes:** ___________________

---

**Remember:** It's always better to delay a deployment than to rush and break production.
