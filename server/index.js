import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INITIAL_SLAYERS, INITIAL_MISSIONS, TWELVE_KIZUKI_RANKINGS } from "./data.js";
import { generateTeams, calculateSquadSynergy } from "./formationEngine.js";
import { assignMissionsToSquads, evaluateSquadMissionFit } from "./assignmentEngine.js";
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  testSupabaseConnection,
  updateSupabaseCredentials,
  fetchSlayersFromSupabase,
  insertSlayerToSupabase,
  deleteSlayerFromSupabase,
  updateSlayerAssignmentInSupabase,
  fetchMissionsFromSupabase,
  insertMissionToSupabase,
  deleteMissionFromSupabase,
  fetchDemonsFromSupabase,
  fetchSquadsFromSupabase,
  saveSquadsToSupabase,
  seedLoreToSupabase
} from "./supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Normalize URL in case Vercel Serverless Function rewrites strip or modify the /api prefix
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && req.url !== "/") {
    req.url = "/api" + req.url;
  }
  next();
});

// In-Memory / Local Cache State (synced with Supabase when connected)
let slayers = JSON.parse(JSON.stringify(INITIAL_SLAYERS));
let missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
let demons = JSON.parse(JSON.stringify(TWELVE_KIZUKI_RANKINGS));
let currentSquads = [];
let reserveSlayers = [];
let lastFormationMeta = null;
let lastAssignmentMeta = null;

// Helper to sync slayer assignment status
function syncSlayerAssignments() {
  const assignedSlayerMap = new Map();
  currentSquads.forEach(squad => {
    squad.members.forEach(member => {
      assignedSlayerMap.set(member.id, squad.id);
    });
  });

  slayers.forEach(slayer => {
    slayer.assignedTeamId = assignedSlayerMap.get(slayer.id) || null;
    if (isSupabaseConfigured()) {
      updateSlayerAssignmentInSupabase(slayer.id, slayer.assignedTeamId).catch(() => {});
    }
  });
}

// -------------------------------------------------------------------
// INITIALIZE DATABASE (Supabase Cloud or In-Memory Lore Fallback)
// -------------------------------------------------------------------
async function initDatabase() {
  if (isSupabaseConfigured()) {
    try {
      console.log("⚡ Checking Supabase Cloud Database connection...");
      const status = await testSupabaseConnection();
      if (status.connected) {
        console.log(`✅ Supabase Connected! Cloud counts: Slayers: ${status.counts.slayers}, Missions: ${status.counts.missions}, Squads: ${status.counts.squads}`);
        
        // If empty in cloud, auto-seed with canon Demon Slayer lore
        if (status.counts.slayers === 0 && status.counts.missions === 0) {
          console.log("🌱 Cloud database is empty. Auto-seeding canon Demon Slayer lore into Supabase...");
          await seedLoreToSupabase({
            slayers: INITIAL_SLAYERS,
            missions: INITIAL_MISSIONS,
            demons: TWELVE_KIZUKI_RANKINGS
          });
          console.log("✅ Auto-seeding completed!");
        }

        // Hydrate from Supabase
        const remoteSlayers = await fetchSlayersFromSupabase();
        if (remoteSlayers && remoteSlayers.length > 0) slayers = remoteSlayers;

        const remoteMissions = await fetchMissionsFromSupabase();
        if (remoteMissions && remoteMissions.length > 0) missions = remoteMissions;

        const remoteDemons = await fetchDemonsFromSupabase();
        if (remoteDemons && remoteDemons.length > 0) demons = remoteDemons;

        const remoteSquads = await fetchSquadsFromSupabase();
        if (remoteSquads && remoteSquads.length > 0) currentSquads = remoteSquads;
      } else {
        console.log("⚠️ Supabase connection status:", status.message || status.error);
      }
    } catch (err) {
      console.error("⚠️ Supabase initialization notice:", err.message);
    }
  } else {
    console.log("ℹ️ Supabase not yet configured. Operating in high-speed In-Memory lore mode.");
  }
}

// -------------------------------------------------------------------
// DATABASE MANAGEMENT ENDPOINTS
// -------------------------------------------------------------------

// Check live Supabase connection status
app.get("/api/database/status", async (req, res) => {
  try {
    const status = await testSupabaseConnection();
    const config = getSupabaseConfig();
    res.json({
      ...status,
      config,
      localCounts: {
        slayers: slayers.length,
        missions: missions.length,
        squads: currentSquads.length,
        demons: demons.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Supabase configuration from Admin Console
app.post("/api/database/config", async (req, res) => {
  try {
    const { url, key } = req.body;
    if (!url || !key) {
      return res.status(400).json({ error: "Both Supabase URL and API Key are required." });
    }

    const testResult = await updateSupabaseCredentials(url, key);
    if (testResult.connected) {
      // Re-hydrate local cache from newly connected Supabase
      const remoteSlayers = await fetchSlayersFromSupabase();
      if (remoteSlayers && remoteSlayers.length > 0) slayers = remoteSlayers;
      const remoteMissions = await fetchMissionsFromSupabase();
      if (remoteMissions && remoteMissions.length > 0) missions = remoteMissions;
      const remoteDemons = await fetchDemonsFromSupabase();
      if (remoteDemons && remoteDemons.length > 0) demons = remoteDemons;
    }

    res.json({
      message: testResult.connected
        ? "⚡ Connected directly to Supabase Cloud Database!"
        : `Credentials saved, but test query failed: ${testResult.error || testResult.message}`,
      result: testResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed canon lore into Supabase Cloud
app.post("/api/database/seed", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(400).json({
        error: "Supabase credentials are not configured yet. Please configure your URL & Key first."
      });
    }

    const result = await seedLoreToSupabase({
      slayers: INITIAL_SLAYERS,
      missions: INITIAL_MISSIONS,
      demons: TWELVE_KIZUKI_RANKINGS
    });

    // Refresh memory
    slayers = await fetchSlayersFromSupabase();
    missions = await fetchMissionsFromSupabase();
    demons = await fetchDemonsFromSupabase();

    res.json({
      message: "🌟 Canon Demon Slayer universe successfully seeded into Supabase Cloud!",
      status: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SQL schema text for easy copy/paste to Supabase SQL editor
app.get("/api/database/schema", (req, res) => {
  try {
    const schemaPath = path.join(__dirname, "..", "supabase_schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      res.setHeader("Content-Type", "text/plain");
      return res.send(sql);
    }
    res.status(404).json({ error: "supabase_schema.sql file not found on server." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------------
// SLAYERS (PARTICIPANTS) ENDPOINTS
// -------------------------------------------------------------------

// List all slayers
app.get("/api/slayers", async (req, res) => {
  const { assigned, role, breathing } = req.query;

  // If Supabase is connected, optionally refresh
  if (isSupabaseConfigured()) {
    try {
      const remote = await fetchSlayersFromSupabase();
      if (remote) slayers = remote;
    } catch (_) {}
  }

  let filtered = [...slayers];

  if (assigned === "true") {
    filtered = filtered.filter(s => s.assignedTeamId !== null);
  } else if (assigned === "false") {
    filtered = filtered.filter(s => s.assignedTeamId === null);
  }

  if (role) {
    filtered = filtered.filter(s => s.preferredRole.toLowerCase() === role.toLowerCase());
  }

  if (breathing) {
    filtered = filtered.filter(s => s.baseBreathing.toLowerCase() === breathing.toLowerCase());
  }

  res.json({
    total: filtered.length,
    slayers: filtered
  });
});

// Create new slayer profile
app.post("/api/slayers", async (req, res) => {
  const {
    name,
    japaneseName,
    breathingStyle,
    baseBreathing,
    rank,
    preferredRole,
    skills,
    interests,
    combatPower
  } = req.body;

  if (!name || !breathingStyle || !preferredRole) {
    return res.status(400).json({ error: "Name, breathing style, and preferred role are required." });
  }

  const newSlayer = {
    id: `slayer-${Date.now()}`,
    name,
    japaneseName: japaneseName || name,
    breathingStyle,
    baseBreathing: baseBreathing || "Water",
    rank: rank || "Mizunoto",
    rankLevel: rank === "Hashira" ? 10 : 5,
    preferredRole: preferredRole || "Vanguard",
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : ["Total Concentration Constant"]),
    interests: Array.isArray(interests) ? interests : (interests ? interests.split(",").map(s => s.trim()) : ["Slayer Training"]),
    combatPower: Number(combatPower) || 75,
    katanaColor: "Nichirin Steel",
    avatar: "⚔️",
    assignedTeamId: null
  };

  if (isSupabaseConfigured()) {
    try {
      const saved = await insertSlayerToSupabase(newSlayer);
      if (saved) {
        slayers.unshift(saved);
        return res.status(201).json({ message: "Slayer enrolled into Supabase & Corps!", slayer: saved });
      }
    } catch (err) {
      console.warn("Supabase insert notice, falling back to local:", err.message);
    }
  }

  slayers.unshift(newSlayer);
  res.status(201).json({ message: "Slayer enrolled successfully into Corps!", slayer: newSlayer });
});

// Delete slayer
app.delete("/api/slayers/:id", async (req, res) => {
  const { id } = req.params;
  const index = slayers.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Slayer not found." });
  }

  // Remove from squad if present
  currentSquads.forEach(sq => {
    sq.members = sq.members.filter(m => m.id !== id);
  });

  if (isSupabaseConfigured()) {
    try {
      await deleteSlayerFromSupabase(id);
    } catch (err) {
      console.warn("Supabase delete notice:", err.message);
    }
  }

  const removed = slayers.splice(index, 1)[0];
  res.json({ message: `Slayer ${removed.name} released from duty.`, removed });
});

// -------------------------------------------------------------------
// MISSIONS (CHALLENGES / ACTIVITIES) ENDPOINTS
// -------------------------------------------------------------------

// List missions
app.get("/api/missions", async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const remote = await fetchMissionsFromSupabase();
      if (remote) missions = remote;
    } catch (_) {}
  }

  res.json({
    total: missions.length,
    missions
  });
});

// Create new mission
app.post("/api/missions", async (req, res) => {
  const {
    title,
    japaneseTitle,
    dangerRank,
    location,
    teamSize,
    requiredRoles,
    preferredBreathing,
    requiredSkills,
    minCombatPower,
    demonEncounter,
    description
  } = req.body;

  if (!title || !dangerRank || !location) {
    return res.status(400).json({ error: "Title, danger rank, and location are required." });
  }

  const newMission = {
    id: `mission-${Date.now()}`,
    title,
    japaneseTitle: japaneseTitle || title,
    dangerRank: dangerRank || "Rank B",
    location,
    teamSize: Number(teamSize) || 4,
    requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : (requiredRoles ? requiredRoles.split(",").map(r => r.trim()) : ["Vanguard"]),
    preferredBreathing: Array.isArray(preferredBreathing) ? preferredBreathing : (preferredBreathing ? preferredBreathing.split(",").map(b => b.trim()) : ["Water"]),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(",").map(s => s.trim()) : ["Total Concentration"]),
    minCombatPower: Number(minCombatPower) || 250,
    demonEncounter: demonEncounter || "Unknown Blood Demon Art User",
    description: description || "Critical dispatch order from Kasugai Crow.",
    assignedTeamId: null
  };

  if (isSupabaseConfigured()) {
    try {
      const saved = await insertMissionToSupabase(newMission);
      if (saved) {
        missions.unshift(saved);
        return res.status(201).json({ message: "Demon incursion mission order saved to Supabase!", mission: saved });
      }
    } catch (err) {
      console.warn("Supabase mission insert notice, falling back to local:", err.message);
    }
  }

  missions.unshift(newMission);
  res.status(201).json({ message: "Demon incursion mission order issued!", mission: newMission });
});

// List ranked demons (Twelve Kizuki & Incursion Demons)
app.get("/api/demons", async (req, res) => {
  const { rank } = req.query;

  if (isSupabaseConfigured()) {
    try {
      const remote = await fetchDemonsFromSupabase();
      if (remote && remote.length > 0) demons = remote;
    } catch (_) {}
  }

  let result = [...demons];
  if (rank) {
    result = result.filter(d => d.dangerRank.toLowerCase() === rank.toLowerCase());
  }
  res.json({
    total: result.length,
    demons: result
  });
});

// Delete mission
app.delete("/api/missions/:id", async (req, res) => {
  const { id } = req.params;
  const index = missions.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Mission not found." });
  }

  // Unlink from squad
  currentSquads.forEach(sq => {
    if (sq.assignedMissionId === id) {
      sq.assignedMissionId = null;
      sq.assignmentMetrics = null;
    }
  });

  if (isSupabaseConfigured()) {
    try {
      await deleteMissionFromSupabase(id);
    } catch (err) {
      console.warn("Supabase mission delete notice:", err.message);
    }
  }

  const removed = missions.splice(index, 1)[0];
  res.json({ message: `Mission ${removed.title} archived.`, removed });
});

// -------------------------------------------------------------------
// SMART TEAM FORMATION ENDPOINTS
// -------------------------------------------------------------------

// Get current squads
app.get("/api/teams", async (req, res) => {
  if (isSupabaseConfigured() && currentSquads.length === 0) {
    try {
      const remote = await fetchSquadsFromSupabase();
      if (remote && remote.length > 0) currentSquads = remote;
    } catch (_) {}
  }

  res.json({
    squads: currentSquads,
    reserveSlayers,
    meta: lastFormationMeta
  });
});

// Generate Teams
app.post("/api/teams/generate", async (req, res) => {
  try {
    const { teamSize = 4 } = req.body;
    
    // Run Smart Formation Engine
    const result = generateTeams(slayers, { teamSize: Number(teamSize), randomize: false });
    
    currentSquads = result.squads;
    reserveSlayers = result.reserveSlayers;
    lastFormationMeta = result.meta;

    syncSlayerAssignments();

    if (isSupabaseConfigured()) {
      saveSquadsToSupabase(currentSquads, lastFormationMeta).catch(err => {
        console.warn("Notice saving squads to Supabase:", err.message);
      });
    }

    res.json({
      message: `Successfully assembled ${currentSquads.length} Demon Slayer squads with team size ${teamSize}!`,
      squads: currentSquads,
      reserveSlayers,
      meta: lastFormationMeta
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Regenerate Teams (Randomized / Shuffled Seed)
app.post("/api/teams/regenerate", async (req, res) => {
  try {
    const { teamSize = 4 } = req.body;

    const result = generateTeams(slayers, { teamSize: Number(teamSize), randomize: true });
    
    currentSquads = result.squads;
    reserveSlayers = result.reserveSlayers;
    lastFormationMeta = { ...result.meta, regenerated: true };

    syncSlayerAssignments();

    if (isSupabaseConfigured()) {
      saveSquadsToSupabase(currentSquads, lastFormationMeta).catch(err => {
        console.warn("Notice saving squads to Supabase:", err.message);
      });
    }

    res.json({
      message: `Kasugai Crows re-dispatched! ${currentSquads.length} new synergistic squads assembled.`,
      squads: currentSquads,
      reserveSlayers,
      meta: lastFormationMeta
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------------
// SMART CHALLENGE / MISSION ASSIGNMENT ENDPOINTS
// -------------------------------------------------------------------

// Run smart matching of formed squads to missions
app.post("/api/assignments/assign", async (req, res) => {
  if (currentSquads.length === 0) {
    return res.status(400).json({ error: "No squads exist. Please generate teams first before assigning missions." });
  }

  const result = assignMissionsToSquads(currentSquads, missions);
  currentSquads = result.squads;
  missions = result.missions;
  lastAssignmentMeta = result.stats;

  if (isSupabaseConfigured()) {
    saveSquadsToSupabase(currentSquads, lastAssignmentMeta).catch(() => {});
  }

  res.json({
    message: `Mission dispatch finalized! ${result.assignments.length} squads deployed to Demon Incursions.`,
    assignments: result.assignments,
    squads: currentSquads,
    missions,
    stats: result.stats
  });
});

// Reset assignments
app.post("/api/assignments/reset", (req, res) => {
  currentSquads.forEach(sq => {
    sq.assignedMissionId = null;
    sq.assignmentMetrics = null;
  });
  missions.forEach(m => {
    m.assignedTeamId = null;
  });

  if (isSupabaseConfigured()) {
    saveSquadsToSupabase(currentSquads, null).catch(() => {});
  }

  res.json({ message: "Mission assignments cleared." });
});

// -------------------------------------------------------------------
// RESET TO INITIAL LORE DATA
// -------------------------------------------------------------------

app.post("/api/reset", async (req, res) => {
  slayers = JSON.parse(JSON.stringify(INITIAL_SLAYERS));
  missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
  demons = JSON.parse(JSON.stringify(TWELVE_KIZUKI_RANKINGS));
  currentSquads = [];
  reserveSlayers = [];
  lastFormationMeta = null;
  lastAssignmentMeta = null;

  if (isSupabaseConfigured()) {
    try {
      await seedLoreToSupabase({
        slayers: INITIAL_SLAYERS,
        missions: INITIAL_MISSIONS,
        demons: TWELVE_KIZUKI_RANKINGS
      });
      await saveSquadsToSupabase([], null);
    } catch (err) {
      console.warn("Notice resetting Supabase:", err.message);
    }
  }

  res.json({
    message: "Demon Slayer Corps Headquarters database restored to canon roster and missions.",
    totalSlayers: slayers.length,
    totalMissions: missions.length
  });
});

// System overview
app.get("/api/overview", (req, res) => {
  const assignedSlayers = slayers.filter(s => s.assignedTeamId !== null).length;
  const assignedMissions = missions.filter(m => m.assignedTeamId !== null).length;
  
  res.json({
    totalSlayers: slayers.length,
    assignedSlayers,
    unassignedSlayers: slayers.length - assignedSlayers,
    totalMissions: missions.length,
    assignedMissions,
    activeSquads: currentSquads.length,
    readinessIndex: Math.round(((assignedSlayers / (slayers.length || 1)) * 50) + ((assignedMissions / (missions.length || 1)) * 50))
  });
});

// Start Express server locally or initialize for Vercel Serverless Function
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🗡️ Demon Slayer Corps Command Server running on http://localhost:${PORT}`);
    await initDatabase();
  });
} else {
  // In Vercel serverless environment, initialize DB on cold start
  initDatabase().catch(err => console.warn("Vercel DB init notice:", err.message));
}

export default app;
