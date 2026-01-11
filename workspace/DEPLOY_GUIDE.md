# 🚀 Deploy ProofLocker in 10 Minutes

## STEP 1: Create GitHub Repo (2 minutes)

1. Go to: **https://github.com/new**
2. Repository name: `prooflocker`
3. Make it **Public** (or Private, your choice)
4. **DO NOT** check "Initialize with README"
5. Click **"Create repository"**
6. You'll see a page with instructions - **IGNORE THEM** for now
7. Copy the URL at the top that looks like:
   ```
   https://github.com/YOUR_USERNAME/prooflocker.git
   ```
   (Save this URL - you'll need it in Step 2)

---

## STEP 2: Push Code to GitHub (1 minute)

Run this command in your terminal:

```bash
./deploy.sh
```

Follow the prompts:
- It will ask for the GitHub URL you copied in Step 1
- Paste it and press ENTER
- It will push your code to GitHub automatically

---

## STEP 3: Deploy to Vercel (3 minutes)

1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel (click the blue button)
4. You'll see the Vercel dashboard
5. Click **"Add New Project"**
6. Find **"prooflocker"** in the list of repos
7. Click **"Import"**
8. Click **"Deploy"** (don't change any settings)
9. Wait ~1 minute for it to deploy
10. ❌ It will FAIL - that's expected! We need to add environment variables

---

## STEP 4: Add Environment Variables (4 minutes)

1. On Vercel, go to your **prooflocker** project
2. Click **"Settings"** (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Add these **7 variables** one by one:

For each one:
- Type the **Name** in the first box
- Type the **Value** in the second box
- Click **"Add"**

---

### Variable 1:
**Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** `https://ofpzqtbhxajptpstbbme.supabase.co`

### Variable 2:
**Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcHpxdGJoeGFqcHRwc3RiYm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTcxMzQsImV4cCI6MjA4MzI5MzEzNH0.h8k8Lx4R2v_y6qJFM1MuFZNoONA7AJZ3zWtyoXXsaHU`

### Variable 3:
**Name:** `DE_API_KEY`
**Value:** `sk_live_UEKT2Y_QS5oiw0urMiZDDMokszo2_LmVF3O6EW5BGbb`

### Variable 4:
**Name:** `DE_TENANT_ID`
**Value:** `928106cb-34a9-405c-8e21-2ab8d7ecafde`

### Variable 5:
**Name:** `DE_ORG_ID`
**Value:** `69ab73c5-307d-4445-8a57-f65641d40405`

### Variable 6:
**Name:** `DE_SIGNING_PRIVATE_KEY_HEX`
**Value:** `5516226c7d0b8fe546df39f1166922a668b0e6fa776872ad616117faa0169d57`

### Variable 7:
**Name:** `DE_API_URL`
**Value:** `https://de-api.constellationnetwork.io/v1`

---

## STEP 5: Redeploy (1 minute)

1. Go to **"Deployments"** tab (top menu)
2. Find the most recent deployment (at the top)
3. Click the **"..."** menu button on the right
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm
6. Wait ~2 minutes

---

## 🎉 DONE!

You'll get a live URL like:
```
https://prooflocker.vercel.app
```

Your app is now LIVE on the internet! Share that URL with anyone.

---

## Troubleshooting

**If deployment fails:**
- Check that all 7 environment variables are added correctly
- Make sure there are no extra spaces in the values
- Try redeploying again

**Need help?**
Just tell me what error you're seeing!
