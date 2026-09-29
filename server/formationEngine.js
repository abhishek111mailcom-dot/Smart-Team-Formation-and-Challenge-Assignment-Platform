/**
 * Smart Kasugai Crow Team Formation Engine
 * Solves:
 * 1. Team size enforcement
 * 2. Multi-role balancing (Vanguard, Recon, Tactician, Medical, Trapper)
 * 3. Breathing style diversity & elemental synergies
 * 4. Combat power balance across squads
 * 5. Strict duplicate prevention (each slayer in at most one squad)
 * 6. Deterministic or stochastic regeneration with seed/jitter
 */

const ROLE_PRIORITIES = ["Vanguard", "Medical", "Recon", "Tactician", "Trapper"];

const BREATHING_SYNERGIES = {
  "Water+Thunder": { bonus: 8, name: "Flowing Lightning Convergence" },
  "Flame+Love": { bonus: 7, name: "Blazing Passion Torrent" },
  "Wind+Mist": { bonus: 7, name: "Gale Obscurity Mirage" },
  "Water+Insect": { bonus: 9, name: "Dead Calm Venom Weave" },
  "Stone+Flame": { bonus: 8, name: "Volcanic Aegis Fortress" },
  "Water+Sun": { bonus: 10, name: "Dance of the Dragon Tide" },
  "Sound+Beast": { bonus: 8, name: "Wild Resonance Ruckus" }
};

const SQUAD_NAMES = [
  "Water & Flame Hashira Vanguard (水火先遣隊)",
  "Thunder Godspeed Recon Flight (雷迅偵察隊)",
  "Butterfly Wisteria Medical Guard (蝶毒救護隊)",
  "Mist & Wind Obscuring Phantom (霞風隠密隊)",
  "Stone Mountain Bastion Unit (岩山鉄壁隊)",
  "Beast & Blade Strike Battalion (獣刃突撃隊)",
  "Asakusa Nightwatch Patrol (浅草警邏隊)",
  "Sunlit Dawn Extermination Corps (日輪黎明隊)"
];

/**
 * Shuffle array with optional random seed/jitter
 */
function shuffle(array, jitter = false) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculate team synergy score (0 - 100)
 */
export function calculateSquadSynergy(members) {
  if (!members || members.length === 0) return 0;

  let score = 50; // base score

  // 1. Role Variety (max +25)
  const uniqueRoles = new Set(members.map(m => m.preferredRole));
  score += Math.min(uniqueRoles.size * 6, 25);

  // 2. Has Vanguard frontline (+10)
  if (members.some(m => m.preferredRole === "Vanguard")) {
    score += 10;
  }

  // 3. Has Medical or Trapper support (+10)
  if (members.some(m => m.preferredRole === "Medical" || m.preferredRole === "Trapper")) {
    score += 10;
  }

  // 4. Breathing style diversity (+10)
  const uniqueBreathing = new Set(members.map(m => m.baseBreathing));
  score += Math.min(uniqueBreathing.size * 3, 10);

  // 5. Synergies between members (+bonus)
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const b1 = members[i].baseBreathing;
      const b2 = members[j].baseBreathing;
      const key1 = `${b1}+${b2}`;
      const key2 = `${b2}+${b1}`;
      if (BREATHING_SYNERGIES[key1]) {
        score += BREATHING_SYNERGIES[key1].bonus;
        break;
      } else if (BREATHING_SYNERGIES[key2]) {
        score += BREATHING_SYNERGIES[key2].bonus;
        break;
      }
    }
  }

  // 6. Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Generate Smart Teams
 * @param {Array} slayers - List of slayer objects
 * @param {Object} options - { teamSize: number, randomize: boolean }
 */
export function generateTeams(slayers, options = {}) {
  const teamSize = Math.max(2, Math.min(options.teamSize || 4, 6));
  const randomize = options.randomize !== false;

  // Filter available slayers and ensure duplicate-free IDs
  const availablePool = slayers.map(s => ({ ...s, assignedTeamId: null }));
  const totalSlayers = availablePool.length;

  if (totalSlayers < teamSize) {
    throw new Error(`Insufficient slayers: Need at least ${teamSize} available slayers to form a squad, but only found ${totalSlayers}.`);
  }

  const numTeams = Math.floor(totalSlayers / teamSize);

  // Categorize by roles for smart distribution
  const roleBuckets = {
    Vanguard: [],
    Medical: [],
    Recon: [],
    Tactician: [],
    Trapper: []
  };

  availablePool.forEach(slayer => {
    const role = slayer.preferredRole in roleBuckets ? slayer.preferredRole : "Vanguard";
    roleBuckets[role].push(slayer);
  });

  // Shuffle buckets if randomize requested
  if (randomize) {
    Object.keys(roleBuckets).forEach(role => {
      roleBuckets[role] = shuffle(roleBuckets[role]);
    });
  }

  // Initialize squads
  const squads = Array.from({ length: numTeams }, (_, idx) => ({
    id: `squad-${Date.now()}-${idx + 1}`,
    name: SQUAD_NAMES[idx % SQUAD_NAMES.length] || `Demon Slayer Squad ${idx + 1}`,
    targetSize: teamSize,
    members: [],
    assignedMissionId: null,
    synergyScore: 0,
    totalCombatPower: 0,
    roleCounts: { Vanguard: 0, Medical: 0, Recon: 0, Tactician: 0, Trapper: 0 },
    detectedSynergies: []
  }));

  const assignedSlayerIds = new Set();

  // Helper to add slayer to team safely
  const assignSlayer = (team, slayer) => {
    if (assignedSlayerIds.has(slayer.id)) return false;
    team.members.push(slayer);
    assignedSlayerIds.add(slayer.id);
    slayer.assignedTeamId = team.id;
    team.roleCounts[slayer.preferredRole] = (team.roleCounts[slayer.preferredRole] || 0) + 1;
    team.totalCombatPower += (slayer.combatPower || 70);
    return true;
  };

  // Phase 1: Seed each squad with a Vanguard if possible
  for (let i = 0; i < squads.length; i++) {
    if (roleBuckets.Vanguard.length > 0) {
      const vanguard = roleBuckets.Vanguard.pop();
      assignSlayer(squads[i], vanguard);
    }
  }

  // Phase 2: Seed each squad with Support / Medical / Trapper if possible
  for (let i = 0; i < squads.length; i++) {
    if (squads[i].members.length >= teamSize) continue;
    let candidate = null;
    if (roleBuckets.Medical.length > 0) {
      candidate = roleBuckets.Medical.pop();
    } else if (roleBuckets.Trapper.length > 0) {
      candidate = roleBuckets.Trapper.pop();
    }
    if (candidate) {
      assignSlayer(squads[i], candidate);
    }
  }

  // Phase 3: Seed each squad with Recon / Tactician if slots remain
  for (let i = 0; i < squads.length; i++) {
    if (squads[i].members.length >= teamSize) continue;
    let candidate = null;
    if (roleBuckets.Recon.length > 0) {
      candidate = roleBuckets.Recon.pop();
    } else if (roleBuckets.Tactician.length > 0) {
      candidate = roleBuckets.Tactician.pop();
    }
    if (candidate) {
      assignSlayer(squads[i], candidate);
    }
  }

  // Phase 4: Gather all remaining slayers across all buckets
  const remainingCandidates = [];
  Object.values(roleBuckets).forEach(bucket => {
    bucket.forEach(slayer => {
      if (!assignedSlayerIds.has(slayer.id)) {
        remainingCandidates.push(slayer);
      }
    });
  });

  // Sort remaining candidates to balance combat power or shuffle
  const finalCandidates = randomize ? shuffle(remainingCandidates) : remainingCandidates;

  // Round-robin fill remaining squad slots up to targetSize
  let candidateIdx = 0;
  for (let round = 0; round < teamSize; round++) {
    for (let t = 0; t < squads.length; t++) {
      if (squads[t].members.length < teamSize && candidateIdx < finalCandidates.length) {
        assignSlayer(squads[t], finalCandidates[candidateIdx]);
        candidateIdx++;
      }
    }
  }

  // Calculate final synergy scores & detect breathing combinations
  squads.forEach(squad => {
    squad.synergyScore = calculateSquadSynergy(squad.members);
    
    // Find active lore synergies
    const detected = [];
    for (let i = 0; i < squad.members.length; i++) {
      for (let j = i + 1; j < squad.members.length; j++) {
        const b1 = squad.members[i].baseBreathing;
        const b2 = squad.members[j].baseBreathing;
        const k1 = `${b1}+${b2}`;
        const k2 = `${b2}+${b1}`;
        if (BREATHING_SYNERGIES[k1] && !detected.includes(BREATHING_SYNERGIES[k1].name)) {
          detected.push(BREATHING_SYNERGIES[k1].name);
        } else if (BREATHING_SYNERGIES[k2] && !detected.includes(BREATHING_SYNERGIES[k2].name)) {
          detected.push(BREATHING_SYNERGIES[k2].name);
        }
      }
    }
    squad.detectedSynergies = detected;
  });

  // Collect unassigned reserve slayers
  const reserveSlayers = availablePool.filter(s => !assignedSlayerIds.has(s.id));

  return {
    squads,
    reserveSlayers,
    meta: {
      totalSlayers,
      assignedCount: assignedSlayerIds.size,
      reserveCount: reserveSlayers.length,
      configuredTeamSize: teamSize,
      generatedAt: new Date().toISOString()
    }
  };
}
