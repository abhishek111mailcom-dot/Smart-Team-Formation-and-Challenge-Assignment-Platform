# 🔺 Deploying to Vercel (バーセル配備手順書)

This platform is configured for **1-click deployment on Vercel** as a full-stack application (Vite React frontend on global edge CDN + Express Serverless Functions on `/api/*`).

---

## 🚀 3-Click Deployment via Vercel Dashboard (Recommended)

### Step 1: Open Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Select your repository: **`Smart-Team-Formation-and-Challenge-Assignment-Platform`** and click **"Import"**.

---

### Step 2: Multi-Service Auto-Detection & Environment Variables
Vercel automatically detects the multi-service architecture from `vercel.json`:
- **Web Service (`web`):** Built from `./client` (`npm run build` -> `dist`)
- **API Service (`api`):** Built from `./server` (Express serverless lambda `index.js`)

> 💡 **Notice "Import multi-service project" card?**
> If Vercel shows the prompt asking for `vercel.json`, simply click the **refresh icon (`⟳`)** in that box so Vercel detects the updated `vercel.json` from the repository!

#### Set Environment Variables:
Expand **"Environment Variables"** and configure:

1. **First Variable:**
   - **Key:** `SUPABASE_KEY` *(make sure this goes in the "Key" box)*
   - **Value:** `sb_publishable_OedBYswDOfMoqtWmrwFs7w_tTruW7bM` *(paste key here in "Value" box)*
2. Click **"+ Add More"**
3. **Second Variable:**
   - **Key:** `SUPABASE_URL`
   - **Value:** `https://tewqlfatjevdrgkmyfya.supabase.co`

*(Note: Even without environment variables, the platform will automatically run in high-speed In-Memory mode without crashing!)*

---

### Step 3: Click "Deploy"!
Click the blue **"Deploy"** button.
Vercel will:
- Install dependencies
- Build the Vite React client into `client/dist`
- Deploy the Serverless Functions at `/api/*`
- Provide you with an active production URL (e.g. `https://smart-team-formation-*.vercel.app`)!

---

## 💻 Alternative: Deploying via Vercel CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Run Vercel CLI (interactive login & deployment)
npx vercel

# 2. For production deployment
npx vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **[Your account]**
- Link to existing project? **No**
- Project name: `demon-slayer-dispatch`
- In which directory is your code located? `./`
- Want to modify settings? **No** (Vercel will automatically read `vercel.json`)

---

## 🛡️ Vercel Architecture Highlights
- **Vercel CDN Edge Network:** Static assets (`/assets/*`, `/images/*`, HTML, CSS, sound synthesizers) are served instantly from 100+ edge locations worldwide.
- **Serverless API Layer (`api/index.js`):** All endpoints (`/api/slayers`, `/api/missions`, `/api/teams/generate`, `/api/database/status`) execute as high-concurrency Node.js serverless lambdas.
- **Zero-Crash Guarantee:** The hybrid fallback ensures the app renders canon Demon Slayer squads and missions even during database cold-starts.
