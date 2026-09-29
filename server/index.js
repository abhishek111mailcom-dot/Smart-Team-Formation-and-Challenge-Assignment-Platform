import express from "express";
import cors from "cors";
import { INITIAL_SLAYERS, INITIAL_MISSIONS, TWELVE_KIZUKI_RANKINGS } from "./data.js";
import { generateTeams, calculateSquadSynergy } from "./formationEngine.js";
import { assignMissionsToSquads, evaluateSquadMissionFit } from "./assignmentEngine.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory State
let slayers = JSON.parse(JSON.stringify(INITIAL_SLAYERS));
let missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
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
  });
}

// -------------------------------------------------------------------
// SLAYERS (PARTICIPANTS) ENDPOINTS
// -------------------------------------------------------------------

// List all slayers
app.get("/api/slayers", (req, res) => {
  const { assigned, role, breathing } = req.query;
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
app.post("/api/slayers", (req, res) => {
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

  slayers.unshift(newSlayer);
  res.status(201).json({ message: "Slayer enrolled successfully into Corps!", slayer: newSlayer });
});

// Delete slayer
app.delete("/api/slayers/:id", (req, res) => {
  const { id } = req.params;
  const index = slayers.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Slayer not found." });
  }

  // Remove from squad if present
  currentSquads.forEach(sq => {
    sq.members = sq.members.filter(m => m.id !== id);
  });

  const removed = slayers.splice(index, 1)[0];
  res.json({ message: `Slayer ${removed.name} released from duty.`, removed });
});

// -------------------------------------------------------------------
// MISSIONS (CHALLENGES / ACTIVITIES) ENDPOINTS
// -------------------------------------------------------------------

// List missions
app.get("/api/missions", (req, res) => {
  res.json({
    total: missions.length,
    missions
  });
});

// Create new mission
app.post("/api/missions", (req, res) => {
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

  missions.unshift(newMission);
  res.status(201).json({ message: "Demon incursion mission order issued!", mission: newMission });
});

// List ranked demons (Twelve Kizuki & Incursion Demons)
app.get("/api/demons", (req, res) => {
  const { rank } = req.query;
  let result = [...TWELVE_KIZUKI_RANKINGS];
  if (rank) {
    result = result.filter(d => d.dangerRank.toLowerCase() === rank.toLowerCase());
  }
  res.json({
    total: result.length,
    demons: result
  });
});

// Delete mission
app.delete("/api/missions/:id", (req, res) => {
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

  const removed = missions.splice(index, 1)[0];
  res.json({ message: `Mission ${removed.title} archived.`, removed });
});

// -------------------------------------------------------------------
// SMART TEAM FORMATION ENDPOINTS
// -------------------------------------------------------------------

// Get current squads
app.get("/api/teams", (req, res) => {
  res.json({
    squads: currentSquads,
    reserveSlayers,
    meta: lastFormationMeta
  });
});

// Generate Teams
app.post("/api/teams/generate", (req, res) => {
  try {
    const { teamSize = 4 } = req.body;
    
    // Run Smart Formation Engine
    const result = generateTeams(slayers, { teamSize: Number(teamSize), randomize: false });
    
    currentSquads = result.squads;
    reserveSlayers = result.reserveSlayers;
    lastFormationMeta = result.meta;

    syncSlayerAssignments();

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
app.post("/api/teams/regenerate", (req, res) => {
  try {
    const { teamSize = 4 } = req.body;

    const result = generateTeams(slayers, { teamSize: Number(teamSize), randomize: true });
    
    currentSquads = result.squads;
    reserveSlayers = result.reserveSlayers;
    lastFormationMeta = { ...result.meta, regenerated: true };

    syncSlayerAssignments();

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
app.post("/api/assignments/assign", (req, res) => {
  if (currentSquads.length === 0) {
    return res.status(400).json({ error: "No squads exist. Please generate teams first before assigning missions." });
  }

  const result = assignMissionsToSquads(currentSquads, missions);
  currentSquads = result.squads;
  missions = result.missions;
  lastAssignmentMeta = result.stats;

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
  res.json({ message: "Mission assignments cleared." });
});

// -------------------------------------------------------------------
// RESET TO INITIAL LORE DATA
// -------------------------------------------------------------------

app.post("/api/reset", (req, res) => {
  slayers = JSON.parse(JSON.stringify(INITIAL_SLAYERS));
  missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
  currentSquads = [];
  reserveSlayers = [];
  lastFormationMeta = null;
  lastAssignmentMeta = null;

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

app.listen(PORT, () => {
  console.log(`🗡️ Demon Slayer Corps Command Server running on http://localhost:${PORT}`);
});
