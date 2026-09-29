/**
 * Smart Challenge & Mission Assignment Engine
 * Matches generated squads to Demon Incursion Missions based on:
 * 1. Required Tactical Roles (Vanguard, Medical, Recon, etc.)
 * 2. Counter Breathing Styles (Water, Flame, Mist, Thunder, etc.)
 * 3. Required Skill Proficiencies
 * 4. Combat Power vs Danger Rating
 * 5. Generates Imperial Kasugai Dispatch Briefing
 */

const DANGER_LEVEL_WEIGHTS = {
  "Rank S": { minAvgPower: 90, urgency: "EXTREME (Twelve Kizuki Upper Moon)" },
  "Rank A": { minAvgPower: 82, urgency: "HIGH (Lower Moon / Blood Demon Art User)" },
  "Rank B": { minAvgPower: 75, urgency: "ELEVATED (Flesh Demon Coven)" },
  "Rank C": { minAvgPower: 65, urgency: "MODERATE (Rogue Demon)" },
  "Rank D": { minAvgPower: 50, urgency: "ROUTINE (Night Patrol)" }
};

/**
 * Calculate compatibility between a squad and a mission
 * Returns score between 0 and 100, plus detailed tactical breakdown
 */
export function evaluateSquadMissionFit(squad, mission) {
  if (!squad || !squad.members || squad.members.length === 0 || !mission) {
    return { score: 0, reasons: ["Insufficient data"], roleCoverage: 0 };
  }

  let score = 40; // baseline
  const reasons = [];

  const squadRoles = new Set(squad.members.map(m => m.preferredRole));
  const squadBreathings = new Set(squad.members.map(m => m.baseBreathing));
  const squadSkills = new Set();
  squad.members.forEach(m => (m.skills || []).forEach(s => squadSkills.add(s.toLowerCase())));

  // 1. Role Coverage check (30% weight)
  let matchedRoles = 0;
  if (mission.requiredRoles && mission.requiredRoles.length > 0) {
    mission.requiredRoles.forEach(reqRole => {
      if (squadRoles.has(reqRole)) {
        matchedRoles++;
      }
    });
    const roleRatio = matchedRoles / mission.requiredRoles.length;
    score += Math.round(roleRatio * 25);
    if (roleRatio === 1) {
      reasons.push(`Perfect tactical role match (All ${matchedRoles} required roles covered)`);
    } else if (matchedRoles > 0) {
      reasons.push(`Partial role match (${matchedRoles}/${mission.requiredRoles.length} roles present)`);
    } else {
      reasons.push(`Missing critical roles: ${mission.requiredRoles.join(", ")}`);
    }
  } else {
    score += 15;
  }

  // 2. Preferred Breathing Counter Advantage (20% weight)
  let breathingMatches = 0;
  if (mission.preferredBreathing && mission.preferredBreathing.length > 0) {
    mission.preferredBreathing.forEach(pref => {
      if (squadBreathings.has(pref)) {
        breathingMatches++;
      }
    });
    if (breathingMatches > 0) {
      const bBonus = Math.min(breathingMatches * 8, 20);
      score += bBonus;
      reasons.push(`Elemental Breathing Advantage: ${breathingMatches} counter-element(s) deployed`);
    }
  }

  // 3. Combat Power vs Danger Rating (25% weight)
  const avgPower = squad.totalCombatPower / squad.members.length;
  const dangerSpec = DANGER_LEVEL_WEIGHTS[mission.dangerRank] || { minAvgPower: 70 };
  
  if (avgPower >= dangerSpec.minAvgPower) {
    score += 15;
    reasons.push(`Combat power meets threat threshold (Avg ${Math.round(avgPower)} vs Req ${dangerSpec.minAvgPower})`);
  } else {
    const deficit = dangerSpec.minAvgPower - avgPower;
    score -= Math.min(Math.round(deficit * 0.8), 20);
    reasons.push(`Power warning: Squad avg ${Math.round(avgPower)} is below recommended ${dangerSpec.minAvgPower} for ${mission.dangerRank}`);
  }

  // 4. Required Skill check (15% weight)
  let skillMatches = 0;
  if (mission.requiredSkills && mission.requiredSkills.length > 0) {
    mission.requiredSkills.forEach(reqSkill => {
      const lower = reqSkill.toLowerCase();
      let hasSkill = false;
      for (const s of squadSkills) {
        if (s.includes(lower) || lower.includes(s)) {
          hasSkill = true;
          break;
        }
      }
      if (hasSkill) skillMatches++;
    });
    const sRatio = skillMatches / mission.requiredSkills.length;
    score += Math.round(sRatio * 15);
    if (skillMatches > 0) {
      reasons.push(`Special skill counter verified (${skillMatches}/${mission.requiredSkills.length})`);
    }
  }

  // Final score clamping
  const finalScore = Math.max(15, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    reasons,
    roleCoverage: mission.requiredRoles && mission.requiredRoles.length > 0 ? (matchedRoles / mission.requiredRoles.length) * 100 : 100,
    breathingMatches
  };
}

/**
 * Smart Assign Missions to Squads
 * Bipartite greedy assignment matching highest compatibility
 */
export function assignMissionsToSquads(squads, missions) {
  if (!squads || squads.length === 0 || !missions || missions.length === 0) {
    return { assignments: [], unassignedSquads: squads || [], unassignedMissions: missions || [] };
  }

  // Reset current assignments
  const clonedSquads = squads.map(sq => ({ ...sq, assignedMissionId: null, assignmentMetrics: null }));
  const clonedMissions = missions.map(m => ({ ...m, assignedTeamId: null }));

  // Build matrix of compatibility
  const candidatePairs = [];

  for (let sIdx = 0; sIdx < clonedSquads.length; sIdx++) {
    for (let mIdx = 0; mIdx < clonedMissions.length; mIdx++) {
      const evaluation = evaluateSquadMissionFit(clonedSquads[sIdx], clonedMissions[mIdx]);
      candidatePairs.push({
        squadIndex: sIdx,
        missionIndex: mIdx,
        squad: clonedSquads[sIdx],
        mission: clonedMissions[mIdx],
        score: evaluation.score,
        evaluation
      });
    }
  }

  // Sort descending by match score
  candidatePairs.sort((a, b) => b.score - a.score);

  const assignedSquadIndices = new Set();
  const assignedMissionIndices = new Set();
  const assignments = [];

  // Greedy 1-to-1 match
  for (const pair of candidatePairs) {
    if (!assignedSquadIndices.has(pair.squadIndex) && !assignedMissionIndices.has(pair.missionIndex)) {
      assignedSquadIndices.add(pair.squadIndex);
      assignedMissionIndices.add(pair.missionIndex);

      // Link squad to mission
      pair.squad.assignedMissionId = pair.mission.id;
      pair.squad.assignmentMetrics = {
        compatibilityScore: pair.score,
        reasons: pair.evaluation.reasons,
        assignedAt: new Date().toISOString()
      };

      // Link mission to squad
      pair.mission.assignedTeamId = pair.squad.id;

      assignments.push({
        squadId: pair.squad.id,
        squadName: pair.squad.name,
        missionId: pair.mission.id,
        missionTitle: pair.mission.title,
        dangerRank: pair.mission.dangerRank,
        location: pair.mission.location,
        compatibilityScore: pair.score,
        evaluation: pair.evaluation
      });
    }
  }

  const unassignedSquads = clonedSquads.filter((_, idx) => !assignedSquadIndices.has(idx));
  const unassignedMissions = clonedMissions.filter((_, idx) => !assignedMissionIndices.has(idx));

  return {
    assignments,
    squads: clonedSquads,
    missions: clonedMissions,
    unassignedSquads,
    unassignedMissions,
    stats: {
      totalSquads: clonedSquads.length,
      assignedSquadsCount: assignedSquadIndices.size,
      totalMissions: clonedMissions.length,
      assignedMissionsCount: assignedMissionIndices.size,
      averageCompatibility: assignments.length > 0 
        ? Math.round(assignments.reduce((acc, curr) => acc + curr.compatibilityScore, 0) / assignments.length)
        : 0
    }
  };
}
