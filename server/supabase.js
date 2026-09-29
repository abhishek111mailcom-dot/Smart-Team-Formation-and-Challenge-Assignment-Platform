import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

// Load .env
dotenv.config({ path: envPath });

let supabaseUrl = process.env.SUPABASE_URL || "";
let supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
let supabaseClient = null;

function initClient() {
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      console.log(`⚡ Supabase client initialized with endpoint: ${supabaseUrl}`);
    } catch (err) {
      console.error("⚠️ Failed to initialize Supabase client:", err.message);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

initClient();

export function isSupabaseConfigured() {
  return Boolean(supabaseClient && supabaseUrl && supabaseKey);
}

export function getSupabaseConfig() {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)(.{4}).*(.{6}\.supabase\.co)/, "$1$2***$3") : "",
    hasKey: Boolean(supabaseKey)
  };
}

export async function testSupabaseConnection() {
  if (!supabaseClient) {
    return {
      connected: false,
      configured: false,
      message: "Supabase credentials are not configured. Currently operating in In-Memory fallback mode."
    };
  }

  try {
    const { count, error } = await supabaseClient
      .from("slayers")
      .select("*", { count: "exact", head: true });

    if (error) {
      return {
        connected: false,
        configured: true,
        error: error.message,
        hint: "Make sure you executed supabase_schema.sql in your Supabase SQL Editor!"
      };
    }

    const { count: missionCount } = await supabaseClient
      .from("missions")
      .select("*", { count: "exact", head: true });

    const { count: squadCount } = await supabaseClient
      .from("squads")
      .select("*", { count: "exact", head: true });

    const { count: demonCount } = await supabaseClient
      .from("twelve_kizuki")
      .select("*", { count: "exact", head: true });

    return {
      connected: true,
      configured: true,
      counts: {
        slayers: count || 0,
        missions: missionCount || 0,
        squads: squadCount || 0,
        demons: demonCount || 0
      }
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: err.message
    };
  }
}

export async function updateSupabaseCredentials(url, key) {
  supabaseUrl = (url || "").trim();
  supabaseKey = (key || "").trim();

  // Save to .env
  const envContent = `PORT=${process.env.PORT || 5000}\nSUPABASE_URL=${supabaseUrl}\nSUPABASE_KEY=${supabaseKey}\n`;
  try {
    fs.writeFileSync(envPath, envContent, "utf8");
    process.env.SUPABASE_URL = supabaseUrl;
    process.env.SUPABASE_KEY = supabaseKey;
  } catch (err) {
    console.error("Could not write .env file:", err.message);
  }

  initClient();
  return testSupabaseConnection();
}

// ------------------------------------------------------------------------------
// DATA CONVERTERS (Postgres snake_case <-> JS camelCase)
// ------------------------------------------------------------------------------
export function slayerToCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    japaneseName: row.japanese_name,
    breathingStyle: row.breathing_style,
    baseBreathing: row.base_breathing,
    rank: row.rank,
    rankLevel: row.rank_level,
    preferredRole: row.preferred_role,
    skills: Array.isArray(row.skills) ? row.skills : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
    combatPower: row.combat_power,
    katanaColor: row.katana_color,
    avatar: row.avatar,
    avatarImage: row.avatar_image,
    assignedTeamId: row.assigned_team_id
  };
}

export function slayerToSnake(slayer) {
  return {
    id: slayer.id,
    name: slayer.name,
    japanese_name: slayer.japaneseName || slayer.name,
    breathing_style: slayer.breathingStyle,
    base_breathing: slayer.baseBreathing || "Water",
    rank: slayer.rank || "Mizunoto",
    rank_level: slayer.rankLevel || 5,
    preferred_role: slayer.preferredRole || "Vanguard",
    skills: slayer.skills || [],
    interests: slayer.interests || [],
    combat_power: slayer.combatPower || 75,
    katana_color: slayer.katanaColor || "Nichirin Steel",
    avatar: slayer.avatar || "⚔️",
    avatar_image: slayer.avatarImage || null,
    assigned_team_id: slayer.assignedTeamId || null
  };
}

export function missionToCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    japaneseTitle: row.japanese_title,
    dangerRank: row.danger_rank,
    location: row.location,
    teamSize: row.team_size,
    requiredRoles: Array.isArray(row.required_roles) ? row.required_roles : [],
    preferredBreathing: Array.isArray(row.preferred_breathing) ? row.preferred_breathing : [],
    requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : [],
    minCombatPower: row.min_combat_power,
    demonEncounter: row.demon_encounter,
    demonImage: row.demon_image,
    secondaryDemonImage: row.secondary_demon_image,
    demonRankTitle: row.demon_rank_title,
    description: row.description,
    assignedTeamId: row.assigned_team_id
  };
}

export function missionToSnake(m) {
  return {
    id: m.id,
    title: m.title,
    japanese_title: m.japaneseTitle || m.title,
    danger_rank: m.dangerRank || "Rank B",
    location: m.location,
    team_size: m.teamSize || 4,
    required_roles: m.requiredRoles || [],
    preferred_breathing: m.preferredBreathing || [],
    required_skills: m.requiredSkills || [],
    min_combat_power: m.minCombatPower || 250,
    demon_encounter: m.demonEncounter,
    demon_image: m.demonImage || null,
    secondary_demon_image: m.secondaryDemonImage || null,
    demon_rank_title: m.demonRankTitle || null,
    description: m.description,
    assigned_team_id: m.assignedTeamId || null
  };
}

export function demonToCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    japaneseName: row.japanese_name,
    rankCategory: row.rank_category,
    rankTitle: row.rank_title,
    dangerRank: row.danger_rank,
    bloodDemonArt: row.blood_demon_art,
    image: row.image,
    secondaryImage: row.secondary_image,
    threatPower: row.threat_power,
    description: row.description,
    counterHint: row.counter_hint
  };
}

export function demonToSnake(d) {
  return {
    id: d.id,
    name: d.name,
    japanese_name: d.japaneseName,
    rank_category: d.rankCategory,
    rank_title: d.rankTitle,
    danger_rank: d.dangerRank,
    blood_demon_art: d.bloodDemonArt,
    image: d.image,
    secondary_image: d.secondaryImage || null,
    threat_power: d.threatPower,
    description: d.description,
    counter_hint: d.counterHint
  };
}

export function squadToCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    japaneseName: row.japanese_name,
    formationStrategy: row.formation_strategy,
    hashiraLeader: row.hashira_leader,
    synergyScore: row.synergy_score,
    members: row.members || [],
    assignedMissionId: row.assigned_mission_id,
    assignmentMetrics: row.assignment_metrics,
    stats: row.stats
  };
}

export function squadToSnake(sq) {
  return {
    id: sq.id,
    name: sq.name,
    japanese_name: sq.japaneseName,
    formation_strategy: sq.formationStrategy,
    hashira_leader: sq.hashiraLeader,
    synergy_score: sq.synergyScore,
    members: sq.members,
    assigned_mission_id: sq.assignedMissionId || null,
    assignment_metrics: sq.assignmentMetrics || null,
    stats: sq.stats || null
  };
}

// ------------------------------------------------------------------------------
// DATABASE REPOSITORY OPERATIONS (Direct Supabase API)
// ------------------------------------------------------------------------------

export async function fetchSlayersFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("slayers")
    .select("*")
    .order("rank_level", { ascending: false });
  if (error) throw error;
  return data.map(slayerToCamel);
}

export async function insertSlayerToSupabase(slayer) {
  if (!supabaseClient) return null;
  const payload = slayerToSnake(slayer);
  const { data, error } = await supabaseClient
    .from("slayers")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return slayerToCamel(data);
}

export async function deleteSlayerFromSupabase(id) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("slayers")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return slayerToCamel(data);
}

export async function updateSlayerAssignmentInSupabase(id, assignedTeamId) {
  if (!supabaseClient) return null;
  const { error } = await supabaseClient
    .from("slayers")
    .update({ assigned_team_id: assignedTeamId })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchMissionsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("missions")
    .select("*")
    .order("min_combat_power", { ascending: false });
  if (error) throw error;
  return data.map(missionToCamel);
}

export async function insertMissionToSupabase(mission) {
  if (!supabaseClient) return null;
  const payload = missionToSnake(mission);
  const { data, error } = await supabaseClient
    .from("missions")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return missionToCamel(data);
}

export async function deleteMissionFromSupabase(id) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("missions")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return missionToCamel(data);
}

export async function fetchDemonsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("twelve_kizuki")
    .select("*")
    .order("threat_power", { ascending: false });
  if (error) throw error;
  return data.map(demonToCamel);
}

export async function fetchSquadsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("squads")
    .select("*");
  if (error) throw error;
  return data.map(squadToCamel);
}

export async function saveSquadsToSupabase(squads, meta) {
  if (!supabaseClient) return null;
  // Clear old squads
  await supabaseClient.from("squads").delete().neq("id", "none");
  if (squads && squads.length > 0) {
    const payload = squads.map(squadToSnake);
    const { error } = await supabaseClient.from("squads").insert(payload);
    if (error) throw error;
  }
  // Record formation run
  if (meta) {
    await supabaseClient.from("formation_history").insert([{
      meta,
      squad_count: squads.length
    }]);
  }
}

export async function seedLoreToSupabase(lore) {
  if (!supabaseClient) {
    throw new Error("Supabase is not configured yet. Please provide your Supabase URL & Key.");
  }

  const { slayers, missions, demons } = lore;

  // 1. Seed Slayers
  if (slayers && slayers.length > 0) {
    const slayerPayload = slayers.map(slayerToSnake);
    const { error: sErr } = await supabaseClient
      .from("slayers")
      .upsert(slayerPayload, { onConflict: "id" });
    if (sErr) throw sErr;
  }

  // 2. Seed Missions
  if (missions && missions.length > 0) {
    const missionPayload = missions.map(missionToSnake);
    const { error: mErr } = await supabaseClient
      .from("missions")
      .upsert(missionPayload, { onConflict: "id" });
    if (mErr) throw mErr;
  }

  // 3. Seed Twelve Kizuki
  if (demons && demons.length > 0) {
    const demonPayload = demons.map(demonToSnake);
    const { error: dErr } = await supabaseClient
      .from("twelve_kizuki")
      .upsert(demonPayload, { onConflict: "id" });
    if (dErr) throw dErr;
  }

  return testSupabaseConnection();
}
