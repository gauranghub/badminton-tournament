import teamsData from "./data/teams.json";
import matchesData from "./data/matches.json";

export const TEAMS = teamsData;
export const MATCHES = matchesData;

export const COURTS = ["Court 1", "Court 2"];

export const ACTIVITY = [
  { t: "2m ago", txt: "Apex Avians lead Sky Strikers 12–9 on Court 3", tone: "live" },
  { t: "8m ago", txt: "Feather Falcons defeated Power Plumes 15–10", tone: "win" },
  { t: "14m ago", txt: "Schedule updated — SF1 moved to 14:30", tone: "info" },
  { t: "22m ago", txt: "Smash Syndicate qualify for Semi Finals", tone: "qual" },
  { t: "34m ago", txt: "Drop Shot Dynasty defeated Net Ninjas 15–13", tone: "win" },
  { t: "48m ago", txt: "Court 2 cleaned & resumed", tone: "info" },
];

export function getCourtName(courtNum, courtNames) {
  return (courtNames && courtNames[courtNum - 1]) || `Court ${courtNum}`;
}

export function findTeam(id, teams = TEAMS) {
  return teams.find(t => t.id === id) || { id, name: "TBD", p1: "—", p2: "—", group: "—", color: "neutral" };
}

// Validates a set score against badminton rules.
// target        — points needed to win (e.g. 15 or 21)
// allowTwoPoint — if true, deuce rule applies: winner must lead by ≥ 2 once target is reached
// Returns null if valid, or an error string if invalid.
export function validateFinalScore(sets, target, allowTwoPoint) {
  for (let i = 0; i < sets.length; i++) {
    const [rawA, rawB] = sets[i];
    const label = sets.length > 1 ? `Set ${i + 1}` : "Score";

    if (rawA === "" || rawB === "")
      return `${label}: both scores are required.`;

    const a = Number(rawA), b = Number(rawB);

    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0)
      return `${label}: scores must be non-negative whole numbers.`;

    if (a === b)
      return `${label}: scores cannot be tied — one team must win the set.`;

    const hi = Math.max(a, b), lo = Math.min(a, b);

    if (hi < target)
      return `${label}: winner must reach at least ${target} points (got ${hi}).`;

    if (!allowTwoPoint) {
      // No deuce: game ends exactly when someone reaches target
      if (hi !== target)
        return `${label}: winner must score exactly ${target} points (got ${hi}).`;
    } else {
      // With deuce rule:
      // If the loser never reached target-1, deuce was never possible —
      // the game ended the moment the winner hit target, so winner = target exactly.
      if (lo <= target - 2 && hi !== target)
        return `${label}: invalid score ${hi}–${lo}. With opponent on ${lo}, the game ends at ${target}–${lo}.`;
      // If loser reached target-1 or more, deuce applies — winner needs a 2-point lead.
      if (lo >= target - 1 && hi - lo < 2)
        return `${label}: deuce reached — winner must lead by at least 2 points (got ${hi}–${lo}).`;
    }
  }
  return null;
}

export function getTeamStats(teamId, matches) {
  const played = matches.filter(
    m => m.status === "done" && (m.a === teamId || m.b === teamId)
  );
  const wins = played.filter(m => m.winner === teamId).length;
  const losses = played.length - wins;
  const pts = wins * 3;
  const tb = played.reduce((sum, m) => {
    const isA = m.a === teamId;
    const set = m.sets[0] || [0, 0];
    return sum + Number(isA ? set[0] : set[1]) - Number(isA ? set[1] : set[0]);
  }, 0);
  return { wins, losses, pts, tb };
}
