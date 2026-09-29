# ⚡ Supabase Database Setup Guide (鬼殺隊 超常データベース)

This guide walks you through connecting your **Demon Slayer Smart Team Formation & Challenge Assignment Platform** to **Supabase** (PostgreSQL cloud database).

---

## 🚀 3 Quick Steps to Connect

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in (or create a free account).
2. Click **"New Project"**.
3. Choose an organization, give your project a name (e.g. `demon-slayer-dispatch`), set a secure database password, and select your nearest region.
4. Click **"Create new project"** (takes ~1-2 minutes to spin up).

---

### Step 2: Initialize Tables & Canon Lore in SQL Editor
1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar menu (or press `New query`).
2. Open [`supabase_schema.sql`](./supabase_schema.sql) from the root of this project (or click the **"Copy SQL Schema"** button directly in the Kokushibo Moon Admin Console).
3. Paste the entire script into the Supabase SQL Editor and click **"Run"** (Ctrl+Enter).
4. ✅ This creates all 5 tables (`slayers`, `missions`, `squads`, `twelve_kizuki`, `formation_history`), enables Row Level Security (RLS) with open policies, and seeds all 16 canon Demon Slayers, 7 Missions, and 10 Demons!

---

### Step 3: Connect to the App
You can connect in either of two easy ways:

#### Option A: Directly inside the Kokushibo Moon Admin Console (Easiest)
1. On the application login screen, click **`🌙 Kokushibo Admin Console`**.
2. In the **"Supabase PostgreSQL Cloud Database Nexus"** card:
   - Paste your **Project URL** (e.g. `https://your-project-ref.supabase.co`)
   - Paste your **API Key** (Anon public key or Service Role key from Supabase **Project Settings → API**)
3. Click **"Save & Connect"**!
4. The status pill will instantly turn **`● Cloud Connected`** and sync with your cloud tables.

#### Option B: Via `.env` File
1. Open [`server/.env`](./server/.env):
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-supabase-anon-or-service-role-key
   ```
2. Save the file and restart the server (`node index.js`).

---

## 🗄️ Database Schema Details

| Table | Description | Key Fields |
|---|---|---|
| `slayers` | Demon Slayer Corps members & Hashira | `id`, `name`, `japanese_name`, `breathing_style`, `base_breathing`, `rank`, `rank_level`, `preferred_role`, `skills`, `interests`, `combat_power`, `katana_color`, `avatar`, `avatar_image`, `assigned_team_id` |
| `missions` | Demon Incursion Challenges & Patrols | `id`, `title`, `japanese_title`, `danger_rank`, `location`, `team_size`, `required_roles`, `preferred_breathing`, `required_skills`, `min_combat_power`, `demon_encounter`, `demon_image`, `description`, `assigned_team_id` |
| `squads` | Formed synergistic teams | `id`, `name`, `japanese_name`, `formation_strategy`, `hashira_leader`, `synergy_score`, `members`, `assigned_mission_id`, `assignment_metrics`, `stats` |
| `twelve_kizuki` | Ranked Upper & Lower Moons | `id`, `name`, `japanese_name`, `rank_category`, `rank_title`, `danger_rank`, `blood_demon_art`, `image`, `threat_power`, `description`, `counter_hint` |
| `formation_history` | Audit log for algorithm runs | `id`, `meta`, `squad_count`, `created_at` |

---

## 🛡️ Hybrid Fallback Architecture
- **Offline / Prior to Config:** If Supabase keys are not set, the platform automatically runs in high-speed in-memory mode using the canon Demon Slayer lore. The application **never crashes or freezes**.
- **Instant Seeding:** At any point after connecting, you can click **"Seed Canon Lore to Cloud"** in the Admin Console to repopulate or sync the cloud database.
