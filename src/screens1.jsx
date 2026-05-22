import React from "react";
import { TEAMS, findTeam, getTeamStats, getCourtName } from "./data.js";
import { MatchesContext } from "./MatchesContext.js";
import { I, TeamAvatar, GroupBadge, StageBadge, Spotlight, StatCard, SectionTitle, ConfettiBurst } from "./components.jsx";

// =================== SCREENS PART 1 ===================
// Landing / Public hero, Login, Dashboard, Teams, Settings

// --------------- LANDING / HOME ---------------
export function LandingScreen({ go, info }) {
  const { matches, teams } = React.useContext(MatchesContext);
  const liveCount = matches.filter(m => m.status === "live").length;
  const numGroups = info?.numGroups ?? 3;
  const numCourts = info?.numCourts ?? 2;

  return (
    <div style={{ position: "relative", padding: "8px 4px 0" }}>
      <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", border: "1px solid var(--stroke)", padding: "56px 48px 48px", background: "linear-gradient(180deg, oklch(0.20 0.03 250 / 0.55), oklch(0.14 0.022 250 / 0.5))" }}>
        <Spotlight left="-80px" top="-100px" color="var(--blue)" size={420} opacity={0.45} />
        <Spotlight left="65%" top="-60px" color="var(--gold)" size={340} opacity={0.30} />
        <Spotlight left="40%" top="60%" color="var(--purple)" size={300} opacity={0.30} />

        <div className="row" style={{ justifyContent: "space-between", marginBottom: 28 }}>
          {liveCount > 0
            ? <span className="badge live"><span className="dot pulse"/>Live now · {liveCount} match{liveCount > 1 ? "es" : ""}</span>
            : <span className="badge">Tournament not started</span>
          }
          <div className="row gap-3">
            <span className="badge">Inter-Office Doubles</span>
            <span className="badge"><span className="mono">{info?.tournamentDate}</span></span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="label" style={{ marginBottom: 14 }}>{info?.tournamentStart}–{info?.tournamentEnd}</div>
          <h1 className="display" style={{
            margin: 0,
            fontSize: 108, lineHeight: 0.92, fontWeight: 600, letterSpacing: "-0.04em",
            color: "var(--text-hi)",
            textShadow: "0 8px 60px oklch(0.78 0.21 238 / 0.35)"
          }}>
            {info?.tournamentName || "Turtlemint Badminton Tournament"}
          </h1>
          <p style={{ margin: "22px auto 0", color: "var(--text-mid)", fontSize: 16, maxWidth: 620, lineHeight: 1.55, textAlign: "center" }}>
            {teams.length > 0
              ? `${teams.length} doubles team${teams.length !== 1 ? "s" : ""}. ${numGroups} group${numGroups !== 1 ? "s" : ""}. ${numCourts} parallel court${numCourts !== 1 ? "s" : ""}. One champion — crowned in a single day.`
              : "Set up your teams and schedule in the admin dashboard to get started."
            }
          </p>
          <div className="row gap-3" style={{ marginTop: 30, justifyContent: "center" }}>
            <button className="btn primary lg" onClick={() => go("dashboard")}>Enter Tournament Dashboard {I.chevron}</button>
            <button className="btn lg" onClick={() => go("public")}>{I.eye} Spectator Mode</button>
          </div>
        </div>

        <div className="grid-12" style={{ alignItems: "stretch", gap: 28 }}>
          <div style={{ gridColumn: "span 7" }}>
            <div className="grid-12" style={{ height: "100%" }}>
              <div style={{ gridColumn: "span 6" }}><MiniStatCard n={String(teams.length).padStart(2,"0")} l="Teams" sub={teams.length === 0 ? "none yet" : `${numGroups} groups`} accent="blue"/></div>
              <div style={{ gridColumn: "span 6" }}><MiniStatCard n={String(matches.length).padStart(2,"0")} l="Matches" sub={matches.length === 0 ? "none scheduled" : "incl. SF & Final"} accent="green"/></div>
              <div style={{ gridColumn: "span 6" }}><MiniStatCard n={String(numGroups).padStart(2,"0")} l="Groups" sub="top 2 advance" accent="purple"/></div>
              <div style={{ gridColumn: "span 6" }}><MiniStatCard n={String(numCourts).padStart(2,"0")} l="Courts" sub="in parallel" accent="gold"/></div>
            </div>
          </div>

          <div style={{ gridColumn: "span 5", position: "relative" }}>
            <LiveScoreboardPreview />
          </div>
        </div>
      </div>

      {/* feature row */}
      <div className="grid-12" style={{ marginTop: 18 }}>
        <FeatureCard col={4} eyebrow="Live" title="Real-time scoring"
          body="Admin pushes points; standings, tie-breakers, and the bracket recalculate instantly across every screen."
          accent="green"/>
        <FeatureCard col={4} eyebrow="Bracket" title="Best-of-3 knockouts"
          body="Semi-finals and finals upgrade to best-of-three with set-by-set tracking and a confetti-laden winner reveal."
          accent="gold"/>
        <FeatureCard col={4} eyebrow="Public" title="TV-ready spectator view"
          body="Cast a full-screen scoreboard to a projector. Auto-rotates between live courts and standings."
          accent="purple"/>
      </div>
    </div>
  );
}

export function MetaPill({ label, v }) {
  return (
    <div className="row gap-2" style={{ alignItems: "baseline" }}>
      <span className="mono" style={{ fontSize: 9.5, color: "var(--text-low)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--text-hi)" }}>{v}</span>
    </div>
  );
}

export function Shuttle3D() {
  // CSS/SVG composite 3D shuttle — feathers radiating from a cork ball
  return (
    <div className="shuttle3d" style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id="cork" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="oklch(0.97 0.02 80)"/>
            <stop offset="60%" stopColor="oklch(0.82 0.10 60)"/>
            <stop offset="100%" stopColor="oklch(0.55 0.10 50)"/>
          </radialGradient>
          <linearGradient id="feather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.005 250 / 0.95)"/>
            <stop offset="100%" stopColor="oklch(0.80 0.02 250 / 0.4)"/>
          </linearGradient>
          <filter id="featherGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Feathers — fan radiating up-left from cork at lower-right */}
        <g transform="translate(135 135) rotate(-30)">
          {[-50, -35, -20, -5, 10, 25].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
              <path d="M0 0 L-12 -110 L12 -110 Z" fill="url(#feather)" stroke="oklch(0.85 0.02 250 / 0.6)" strokeWidth="0.8" filter="url(#featherGlow)" opacity="0.92"/>
              <line x1="0" y1="0" x2="0" y2="-105" stroke="oklch(0.95 0.005 250 / 0.7)" strokeWidth="0.8"/>
            </g>
          ))}
          {/* skirt rings */}
          <ellipse cx="0" cy="-40" rx="36" ry="10" fill="none" stroke="oklch(0.95 0.005 250 / 0.45)" strokeWidth="1.2"/>
          <ellipse cx="0" cy="-75" rx="44" ry="13" fill="none" stroke="oklch(0.95 0.005 250 / 0.35)" strokeWidth="1"/>
        </g>
        {/* Cork ball */}
        <circle cx="135" cy="135" r="22" fill="url(#cork)" stroke="oklch(0.45 0.08 50 / 0.8)" strokeWidth="1"/>
        <circle cx="128" cy="128" r="6" fill="oklch(1 0 0 / 0.4)"/>
      </svg>
    </div>
  );
}

export function MiniStatCard({ n, l, sub, accent }) {
  const c = { blue: "var(--blue)", green: "var(--green)", purple: "var(--purple)", gold: "var(--gold)" }[accent];
  return (
    <div className="glass lift" style={{ padding: 18, position: "relative", overflow: "hidden", height: "100%" }}>
      <div style={{ position: "absolute", right: -16, top: -16, width: 100, height: 100, borderRadius: "50%", background: c, opacity: 0.10, filter: "blur(36px)" }}/>
      <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
        <span className="display" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1, color: "var(--text-hi)" }}>{n}</span>
        <span className="label" style={{ margin: 0 }}>{l}</span>
      </div>
      {sub && <div className="mono" style={{ fontSize: 11, color: c, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

export function MiniStat({ n, l }) {
  return (
    <div>
      <div className="display" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, color: "var(--text-hi)" }}>{n}</div>
      <div className="label" style={{ margin: "6px 0 0" }}>{l}</div>
    </div>
  );
}

export function FeatureCard({ col = 4, eyebrow, title, body, accent }) {
  const c = { green: "var(--green)", gold: "var(--gold)", purple: "var(--purple)", blue: "var(--blue)" }[accent];
  return (
    <div className="glass lift" style={{ gridColumn: `span ${col}`, padding: 22, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c, boxShadow: `0 0 18px ${c}` }}/>
      <div className="label" style={{ color: c, marginBottom: 10 }}>{eyebrow}</div>
      <h3 className="display" style={{ margin: 0, fontSize: 19, fontWeight: 600, color: "var(--text-hi)" }}>{title}</h3>
      <p style={{ margin: "10px 0 0", color: "var(--text-mid)", fontSize: 13.5, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

export function LiveScoreboardPreview() {
  const { matches: MATCHES, teams, courtNames } = React.useContext(MatchesContext);
  const live = MATCHES.find(m => m.status === "live");

  if (!live) {
    return (
      <div className="glass" style={{ padding: 22, textAlign: "center" }}>
        <div className="label" style={{ marginBottom: 6 }}>No live match right now</div>
        <div style={{ fontSize: 12.5, color: "var(--text-low)" }}>Matches will appear here once started</div>
      </div>
    );
  }

  const a = findTeam(live.a, teams), b = findTeam(live.b, teams);
  return (
    <div className="glass live-glow" style={{ padding: 22, position: "relative" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <span className="badge live"><span className="dot pulse"/>Now Playing · {getCourtName(live.court, courtNames)}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>Match {live.id} · Group {live.group}</span>
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
        <div className="row gap-3">
          <TeamAvatar team={a} size={44}/>
          <div>
            <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-low)" }}>{a.p1} · {a.p2}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--stroke)" }}/>
        <span className="mono" style={{ fontSize: 11, color: "var(--blue)", letterSpacing: "0.16em" }}>VS</span>
        <div style={{ flex: 1, height: 1, background: "var(--stroke)" }}/>
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
        <div className="row gap-3">
          <TeamAvatar team={b} size={44}/>
          <div>
            <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>{b.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-low)" }}>{b.p1} · {b.p2}</div>
          </div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>SET 1 · FIRST TO 15</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}><span className="dot pulse"/> Match in progress</span>
      </div>
    </div>
  );
}

// --------------- LOGIN ---------------
export function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleLogin = () => {
    if (email === "admin@gmail.com" && pass === "turtle") {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 600, position: "relative", padding: "40px 0" }}>
      <Spotlight left="20%" top="10%" color="var(--blue)" size={420} opacity={0.4} />
      <Spotlight left="60%" top="60%" color="var(--purple)" size={360} opacity={0.3} />
      <div className="glass" style={{ padding: 36, width: 420, maxWidth: "96%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% -10%, oklch(0.78 0.21 238 / 0.18), transparent 60%)", pointerEvents: "none" }}/>
        <div className="row gap-3" style={{ marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, var(--blue), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
            boxShadow: "0 0 24px oklch(0.74 0.18 238 / 0.55)",
          }}>{I.shuttle}</div>
          <div>
            <div className="label">Admin Access</div>
            <div className="display" style={{ fontSize: 20, fontWeight: 600, color: "var(--text-hi)" }}>APEX Control</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="label">Password</label>
          <input className="input" type="password" value={pass} onChange={e => { setPass(e.target.value); setError(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && (
          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "oklch(0.55 0.20 25 / 0.15)", border: "1px solid oklch(0.55 0.20 25 / 0.4)", fontSize: 13, color: "var(--red)" }}>
            Incorrect email or password.
          </div>
        )}
        <button className="btn primary lg" style={{ width: "100%" }} onClick={handleLogin}>
          Sign in to Control Center {I.chevron}
        </button>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 18, fontSize: 12, color: "var(--text-low)" }}>
          <span>Tournament referees only</span>
          <span className="mono">v 4.2.1</span>
        </div>
      </div>
    </div>
  );
}

// --------------- DASHBOARD ---------------
export function DashboardScreen({ go, info, isAdmin }) {
  const { matches: MATCHES, teams, courtNames, groupStageLocked, lockGroupStage, unlockGroupStage, tournamentComplete, reopenTournament } = React.useContext(MatchesContext);
  const liveMatches = MATCHES.filter(m => m.status === "live");
  const liveCount = liveMatches.length;
  const done = MATCHES.filter(m => m.status === "done").length;
  const upcoming = MATCHES.filter(m => m.status === "upcoming").length;
  const groupMatches = MATCHES.filter(m => m.stage === "group");
  const semiMatches  = MATCHES.filter(m => m.stage === "semi");
  const finalMatch   = MATCHES.find(m => m.stage === "final");
  const allGroupDone = groupMatches.length > 0 && groupMatches.every(m => m.status === "done");
  const allSemisDone = semiMatches.length > 0 && semiMatches.every(m => m.status === "done");
  const finalDone    = finalMatch?.status === "done";
  const [confirmLock, setConfirmLock] = React.useState(false);

  // groupStageLocked can be a stale localStorage value — only trust it when matches confirm it
  const lockIsValid = groupStageLocked && allGroupDone;

  const stageLabel = (() => {
    if (MATCHES.length === 0)    return "No matches scheduled yet";
    if (finalDone)               return "Tournament complete 🏆";
    if (allSemisDone)            return "Final in progress";
    if (lockIsValid && semiMatches.some(m => m.status === "live")) return "Semi-finals in progress";
    if (lockIsValid)             return "Knockout stage · semi-finals upcoming";
    if (allGroupDone)            return "Group stage complete · ready for knockouts";
    if (groupMatches.length > 0) return "Group stage in progress";
    return "Tournament not started";
  })();

  return (
    <div>
      <SectionTitle
        eyebrow="Control Center"
        title="Tournament Overview"
        sub={`${stageLabel} · ${info?.tournamentDate || ""}`}
        right={
          isAdmin ? <button className="btn primary sm" onClick={() => go("live")}>{I.bolt} Score Live Match</button> : null
        }
      />

      <div className="grid-12" style={{ marginBottom: 18 }}>
        <div style={{ gridColumn: "span 3" }}><StatCard label="Total Teams" value={teams.length} sub={teams.length === 0 ? "none registered yet" : `${info?.numGroups ?? 3} groups`} icon={I.teams} accent="blue" /></div>
        <div style={{ gridColumn: "span 3" }}><StatCard label="Matches Played"  value={done} sub={`/ ${MATCHES.length} total`} icon={I.check} accent="green" /></div>
        <div style={{ gridColumn: "span 3" }}><StatCard label="Remaining"       value={upcoming} sub="incl. SF & Final" icon={I.schedule} accent="purple" /></div>
        <div style={{ gridColumn: "span 3" }}><StatCard label="Courts" value={`${info?.numCourts ?? 2} / ${info?.numCourts ?? 2}`} sub="in parallel" icon={I.live} accent="gold" /></div>
      </div>

      {isAdmin && allGroupDone && !lockIsValid && (
        <div className="glass" style={{ padding: "16px 20px", marginBottom: 18, borderTop: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>{I.check} All group matches complete</div>
            <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginTop: 2 }}>Lock the group stage to prevent further score edits and advance to knockouts.</div>
          </div>
          <button className="btn primary sm" onClick={() => setConfirmLock(true)}>End Group Stage</button>
        </div>
      )}

      {confirmLock && (
        <div onClick={() => setConfirmLock(false)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0 0 0 / 0.65)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: "100%", padding: 40, background: "linear-gradient(180deg, oklch(0.22 0.025 252), oklch(0.15 0.022 252))", border: "1px solid var(--stroke-strong)", borderTop: "3px solid var(--purple)", borderRadius: "var(--r-lg)", boxShadow: "0 40px 80px -20px oklch(0 0 0 / 0.8)", position: "relative", overflow: "hidden" }}>
            <Spotlight left="50%" top="-60px" color="var(--purple)" size={300} opacity={0.3}/>
            <div style={{ textAlign: "center", marginBottom: 28, position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏸</div>
              <h2 className="display" style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: "var(--text-hi)" }}>End Group Stage?</h2>
              <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-mid)", lineHeight: 1.6 }}>
                All group match scores will be <strong style={{ color: "var(--text-hi)" }}>permanently locked</strong>.<br/>
                The knockout bracket will be auto-populated based on final standings.
              </p>
            </div>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: "oklch(0.68 0.20 295 / 0.10)", border: "1px solid oklch(0.68 0.20 295 / 0.35)", marginBottom: 28, fontSize: 13, color: "var(--text-mid)", position: "relative", zIndex: 1 }}>
              <div style={{ fontWeight: 600, color: "var(--text-hi)", marginBottom: 6 }}>What happens next:</div>
              <div>· Group stage scores are locked — no further edits</div>
              <div>· Semi-final matchups are set from Points Table</div>
              <div>· Knockouts are ready to begin</div>
            </div>
            <div className="row gap-3" style={{ position: "relative", zIndex: 1 }}>
              <button className="btn ghost" style={{ flex: 1, padding: "12px 0", fontSize: 14 }} onClick={() => setConfirmLock(false)}>Cancel</button>
              <button className="btn primary" style={{ flex: 1, padding: "12px 0", fontSize: 14, background: "linear-gradient(135deg, var(--purple), var(--blue))", boxShadow: "0 8px 24px -8px oklch(0.68 0.20 295 / 0.6)" }}
                onClick={() => { lockGroupStage(); setConfirmLock(false); }}>
                {I.check} Confirm &amp; Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && lockIsValid && (
        <div className="glass" style={{ padding: "12px 20px", marginBottom: 18, borderTop: "2px solid var(--purple)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="badge semi" style={{ marginRight: 10 }}>Group Stage Ended</span>
            <span style={{ fontSize: 12.5, color: "var(--text-mid)" }}>Scores are locked. Knockout stage is active.</span>
          </div>
          <button className="btn sm ghost" onClick={unlockGroupStage}>Reopen Group Stage</button>
        </div>
      )}

      {tournamentComplete && (() => {
        const finalMatch  = MATCHES.find(m => m.stage === "final" && m.status === "done");
        const champion    = finalMatch ? findTeam(finalMatch.winner, teams) : null;
        const runnerUp    = finalMatch ? findTeam(finalMatch.winner === finalMatch.a ? finalMatch.b : finalMatch.a, teams) : null;
        const totalSets   = MATCHES.filter(m => m.status === "done").reduce((sum, m) => sum + m.sets.length, 0);
        const mostWins    = [...teams].map(t => ({
          team: t,
          wins: MATCHES.filter(m => m.status === "done" && m.winner === t.id).length,
        })).sort((a, b) => b.wins - a.wins)[0];
        if (!champion) return null;
        return (
          <>
            {/* Champion Banner */}
            <div className="glass" style={{ padding: "32px 36px", marginBottom: 18, borderTop: "3px solid var(--gold)", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <Spotlight left="50%" top="-40px" color="var(--gold)" size={400} opacity={0.35}/>
              <ConfettiBurst/>
              <div style={{ position: "relative", zIndex: 2 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--gold)", marginBottom: 10 }}>TOURNAMENT CHAMPION</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <TeamAvatar team={champion} size={72}/>
                </div>
                <h2 className="display" style={{ margin: "0 0 6px", fontSize: 36, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.02em" }}>{champion.name}</h2>
                <div style={{ fontSize: 15, color: "var(--text-mid)" }}>{champion.p1} &amp; {champion.p2}</div>
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-low)" }}>
                  Runner-up: <span style={{ color: "var(--text-hi)", fontWeight: 500 }}>{runnerUp?.name}</span>
                </div>
                {isAdmin && (
                  <button className="btn sm ghost" style={{ marginTop: 16 }} onClick={reopenTournament}>Reopen Tournament</button>
                )}
              </div>
            </div>

            {/* Tournament Summary */}
            <div className="glass" style={{ padding: 24, marginBottom: 18, borderTop: "2px solid var(--green)" }}>
              <div className="label" style={{ marginBottom: 16 }}>Tournament Summary</div>
              <div className="grid-12" style={{ gap: 14 }}>
                <div style={{ gridColumn: "span 3" }}>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>CHAMPION</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gold)" }}>{champion.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)" }}>{champion.p1} · {champion.p2}</div>
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>RUNNER-UP</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>{runnerUp?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)" }}>{runnerUp?.p1} · {runnerUp?.p2}</div>
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>MOST WINS</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>{mostWins?.team.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)" }}>{mostWins?.wins} wins</div>
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>TOTALS</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>{MATCHES.filter(m => m.status === "done").length} matches</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)" }}>{totalSets} sets played</div>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      <div className="grid-12" style={{ marginBottom: 18 }}>
        {/* Live matches */}
        <div style={{ gridColumn: "span 8" }}>
          {liveMatches.length === 0 ? (
            <div className="glass" style={{ padding: "48px 24px", textAlign: "center" }}>
              <div className="label" style={{ marginBottom: 8 }}>No matches currently live</div>
              <button className="btn sm" onClick={() => go("live")}>{I.edit} Go to Score Matches</button>
            </div>
          ) : (
            <div className="col gap-3">
              {liveMatches.map(m => (
                <div key={m.id} className="glass" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
                  <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--stroke)" }}>
                    <div className="row gap-3">
                      <span className="badge live"><span className="dot pulse"/>Live · {getCourtName(m.court, courtNames)}</span>
                      <span className="badge upcoming">Match {m.id}</span>
                      <GroupBadge g={m.group}/>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>{m.time}</span>
                  </div>
                  <DashLiveScore m={m} />
                  <div className="row" style={{ justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--stroke)", background: "oklch(0 0 0 / 0.25)" }}>
                    <div className="row gap-3">
                      <button className="btn sm" onClick={() => go("live")}>{I.edit} Enter Result</button>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-mid)" }}>Final score recorded after match ends</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* progress */}
        <div style={{ gridColumn: "span 4" }}>
          <div className="glass" style={{ padding: 20, height: "100%" }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
              <span className="label" style={{ margin: 0 }}>Tournament Progress</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-mid)" }}>{Math.round(done / MATCHES.length * 100)}%</span>
            </div>
            <ProgressTrack matches={MATCHES} />
            <div className="col gap-2" style={{ marginTop: 18, fontSize: 12, color: "var(--text-mid)" }}>
              <Legend c="var(--green)"              t="Completed"  n={done}/>
              <Legend c="var(--blue)"               t="Live"       n={liveCount}/>
              <Legend c="oklch(0.55 0.05 250 / 0.5)" t="Upcoming" n={MATCHES.filter(m => m.status === "upcoming" && m.stage === "group").length}/>
              <Legend c="var(--purple)"             t="Semi Final" n={MATCHES.filter(m => m.stage === "semi").length}/>
              <Legend c="var(--gold)"               t="Final"      n={MATCHES.filter(m => m.stage === "final" && m.id !== "3RD").length}/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-12">
        {/* upcoming */}
        <div style={{ gridColumn: "span 12" }}>
          <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
            <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--stroke)" }}>
              <span className="label" style={{ margin: 0 }}>Up Next</span>
              <button className="btn sm ghost" onClick={() => go("schedule")}>View full schedule {I.chevron}</button>
            </div>
            <div>
              {MATCHES
                .filter(m => m.status === "upcoming")
                .sort((a, b) => a.time.localeCompare(b.time))
                .slice(0, 6)
                .map((m, i, arr) => <UpcomingRow key={m.id} m={m} last={i === arr.length - 1}/>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashLiveScore({ m }) {
  const { teams } = React.useContext(MatchesContext);
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  return (
    <div style={{ padding: "24px 24px", position: "relative" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-3" style={{ flex: 1 }}>
          <TeamAvatar team={a} size={48}/>
          <div>
            <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-low)" }}>{a.p1} · {a.p2}</div>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "0 28px" }}>
          <div className="display" style={{ fontSize: 22, color: "var(--text-low)", fontWeight: 500, letterSpacing: "0.08em" }}>VS</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--green)", marginTop: 6 }}>
            <span className="dot pulse"/> MATCH IN PROGRESS
          </div>
        </div>
        <div className="row gap-3" style={{ flex: 1, justifyContent: "flex-end", flexDirection: "row-reverse" }}>
          <TeamAvatar team={b} size={48}/>
          <div style={{ textAlign: "right" }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>{b.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-low)" }}>{b.p1} · {b.p2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressTrack({ matches }) {
  return (
    <div className="row" style={{ gap: 4, height: 36 }}>
      {matches.map(m => {
        let bg = "oklch(0.55 0.05 250 / 0.18)";
        if (m.status === "done") bg = "var(--green)";
        if (m.status === "live") bg = "var(--blue)";
        if (m.stage === "semi" && m.status === "upcoming") bg = "oklch(0.68 0.20 295 / 0.4)";
        if (m.stage === "final" && m.status === "upcoming") bg = "oklch(0.85 0.16 88 / 0.4)";
        return (
          <div key={m.id} title={`${m.id} · ${m.status}`} style={{
            flex: 1, height: "100%", borderRadius: 4, background: bg,
            boxShadow: m.status === "live" ? "0 0 10px var(--blue)" : "none",
            transition: "all 0.2s ease"
          }}/>
        );
      })}
    </div>
  );
}

export function Legend({ c, t, n }) {
  return (
    <div className="row gap-2">
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }}/>
      <span>{t}</span>
      <span className="mono" style={{ color: "var(--text-low)" }}>{n}</span>
    </div>
  );
}

export function ActivityDot({ tone }) {
  const map = { live: "var(--blue)", win: "var(--green)", info: "var(--text-mid)", qual: "var(--gold)" };
  return <span style={{ width: 8, height: 8, borderRadius: 2, background: map[tone], boxShadow: tone === "live" ? "0 0 8px var(--blue)" : "none", flexShrink: 0 }}/>;
}

export function UpcomingRow({ m, last }) {
  const { teams, courtNames } = React.useContext(MatchesContext);
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  return (
    <div className="row" style={{ padding: "14px 20px", borderBottom: last ? "none" : "1px solid oklch(1 0 0 / 0.04)", gap: 16 }}>
      <span className="mono" style={{ width: 44, fontSize: 11, color: "var(--text-low)" }}>{m.time}</span>
      <div className="row gap-2" style={{ flex: 1 }}>
        <TeamAvatar team={a} size={28}/>
        <span style={{ fontSize: 13, color: "var(--text-hi)" }}>{a.name}</span>
        <span className="mono" style={{ color: "var(--text-low)", fontSize: 11, margin: "0 8px" }}>vs</span>
        <TeamAvatar team={b} size={28}/>
        <span style={{ fontSize: 13, color: "var(--text-hi)" }}>{b.name}</span>
      </div>
      <span className="badge" style={{ fontSize: 10 }}>{getCourtName(m.court, courtNames)}</span>
      <GroupBadge g={m.group}/>
    </div>
  );
}

export function CourtRow({ c, state, team, tag }) {
  const meta = {
    live:     { color: "var(--green)", label: "LIVE" },
    cleaning: { color: "var(--gold)",  label: "CLEANING" },
    ready:    { color: "var(--blue)",  label: "READY" },
  }[state];
  return (
    <div className="glass-thin" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <span className="display" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>Court {c}</span>
        <span className="mono" style={{ fontSize: 10.5, color: meta.color }}><span className="dot" style={{ background: meta.color }}/> {meta.label}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginBottom: 4 }}>{team}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>{tag}</div>
    </div>
  );
}

// --------------- TEAMS ---------------
export function TeamsScreen({ isAdmin, info }) {
  const { teams } = React.useContext(MatchesContext);
  const ALL_LABELS = ["A", "B", "C", "D"];
  const groupLabels = ALL_LABELS.slice(0, info?.numGroups ?? 3);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? teams : teams.filter(t => t.group === filter);

  return (
    <div>
      <SectionTitle
        eyebrow={`Teams · ${teams.length} registered${isAdmin ? "" : " · Read-only"}`}
        title="Team Registry"
        sub="Every doubles team, their players, and their current group assignment."
        right={
          <div className="row gap-3">
            <div className="seg">
              {["all", ...groupLabels].map(g => (
                <button key={g} className={filter === g ? "active" : ""} onClick={() => setFilter(g)}>
                  {g === "all" ? "All" : `Group ${g}`}
                </button>
              ))}
            </div>
            {isAdmin && (
              <div className="row gap-2">
                <button className="btn sm ghost" onClick={() => setBulkOpen(true)}>{I.teams} Bulk Add</button>
                <button className="btn primary sm" onClick={() => setModalOpen(true)}>{I.plus} Add Team</button>
              </div>
            )}
          </div>
        }
      />

      <div className="grid-12">
        {filtered.map(t => (
          <TeamCard key={t.id} t={t} isAdmin={isAdmin} groupLabels={groupLabels} onEdit={setEditingTeam} />
        ))}
      </div>

      {modalOpen && <AddTeamModal onClose={() => setModalOpen(false)} groupLabels={groupLabels} teams={teams} />}
      {editingTeam && <EditTeamModal team={editingTeam} groupLabels={groupLabels} onClose={() => setEditingTeam(null)} />}
      {bulkOpen && <BulkAddModal onClose={() => setBulkOpen(false)} groupLabels={groupLabels} teams={teams} />}
    </div>
  );
}

export function TeamCard({ t, isAdmin, groupLabels, onEdit }) {
  const { matches: MATCHES, removeTeam } = React.useContext(MatchesContext);
  const live = MATCHES.find(m => m.status === "live" && (m.a === t.id || m.b === t.id));
  const stats = getTeamStats(t.id, MATCHES);
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className={`glass lift group-rail-${t.group} group-tint-${t.group}`} style={{ gridColumn: "span 4", padding: 18, position: "relative", overflow: "hidden" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <GroupBadge g={t.group}/>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>{t.level || "—"}</span>
      </div>
      <div className="row gap-3" style={{ marginBottom: 16 }}>
        <TeamAvatar team={t} size={56}/>
        <div style={{ minWidth: 0 }}>
          <div className="display" style={{ fontSize: 19, fontWeight: 600, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>{t.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginTop: 4 }}>{t.p1} · {t.p2}</div>
        </div>
      </div>

      <div className="row gap-4" style={{ paddingTop: 14, borderTop: "1px solid var(--stroke)" }}>
        <Stat l="Wins" v={stats.wins} c="var(--green)"/>
        <Stat l="Losses" v={stats.losses} c="var(--red)"/>
        <Stat l="Points" v={stats.pts}/>
        <Stat l="Tie-B" v={stats.tb >= 0 ? `+${stats.tb}` : stats.tb} c={stats.tb >= 0 ? "var(--text-hi)" : "var(--red)"}/>
      </div>

      {live && (
        <div className="row" style={{ marginTop: 14, padding: 10, borderRadius: 10, background: "oklch(0.84 0.22 145 / 0.08)", border: "1px solid oklch(0.84 0.22 145 / 0.25)" }}>
          <span className="badge live" style={{ marginRight: "auto" }}><span className="dot pulse"/>Playing now</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>{getCourtName(live.court, courtNames)}</span>
        </div>
      )}

      {isAdmin && !confirming && (
        <div className="row gap-2" style={{ marginTop: 14 }}>
          <button className="btn sm ghost" style={{ flex: 1 }} onClick={() => onEdit(t)}>{I.edit} Edit</button>
          <button className="btn sm ghost" style={{ color: "var(--red)" }} onClick={() => setConfirming(true)}>{I.trash}</button>
        </div>
      )}

      {confirming && (
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "oklch(0.55 0.20 25 / 0.12)", border: "1px solid oklch(0.55 0.20 25 / 0.35)" }}>
          <div style={{ fontSize: 13, color: "var(--text-hi)", marginBottom: 10 }}>
            Remove <strong>{t.name}</strong>? This cannot be undone.
          </div>
          <div className="row gap-2">
            <button className="btn sm ghost" style={{ flex: 1 }} onClick={() => setConfirming(false)}>Cancel</button>
            <button className="btn sm" style={{ flex: 1, background: "oklch(0.55 0.20 25 / 0.25)", borderColor: "oklch(0.55 0.20 25 / 0.5)", color: "var(--red)" }}
              onClick={() => { removeTeam(t.id); setConfirming(false); }}>
              {I.trash} Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export function Stat({ l, v, c }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="label" style={{ margin: "0 0 4px" }}>{l}</div>
      <div className="mono" style={{ fontSize: 18, color: c || "var(--text-hi)", fontWeight: 600 }}>{v}</div>
    </div>
  );
}

export function AddTeamModal({ onClose, groupLabels = ["A", "B", "C"], teams = [] }) {
  const { addTeam } = React.useContext(MatchesContext);
  const GROUP_COLORS = { A: "blue", B: "green", C: "purple", D: "gold" };

  const [name, setName]   = React.useState("");
  const [p1, setP1]       = React.useState("");
  const [p2, setP2]       = React.useState("");
  const [group, setGroup] = React.useState(groupLabels[0] || "A");
  const [level, setLevel] = React.useState("Beginner");
  const [error, setError] = React.useState("");

  const handleSubmit = () => {
    if (!name.trim())  return setError("Team name is required.");
    if (!p1.trim())    return setError("Player 1 name is required.");
    if (!p2.trim())    return setError("Player 2 name is required.");

    const id = `T${String(teams.length + 1).padStart(2, "0")}`;
    const newTeam = {
      id,
      name:    name.trim(),
      p1:      p1.trim(),
      p2:      p2.trim(),
      group,
      color:   GROUP_COLORS[group] || "blue",
      level,
    };
    addTeam(newTeam);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        padding: 32, width: 480, maxWidth: "100%", position: "relative",
        background: "linear-gradient(180deg, oklch(0.22 0.025 252) 0%, oklch(0.16 0.022 252) 100%)",
        border: "1px solid var(--stroke-strong)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-pop), 0 0 60px -10px oklch(0 0 0 / 0.8)",
        overflow: "hidden",
      }}>
        <Spotlight left="-40px" top="-60px" color="var(--blue)" size={240} opacity={0.35}/>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="label">New Registration</div>
            <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>Add Doubles Team</h3>
          </div>
          <button className="btn sm ghost" onClick={onClose}>{I.close}</button>
        </div>

        <div className="col gap-4">
          <div>
            <label className="label">Team Name</label>
            <input className="input" placeholder="e.g. Smash Bandits" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label className="label">Player 1</label>
              <input className="input" placeholder="Full name" value={p1} onChange={e => { setP1(e.target.value); setError(""); }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Player 2</label>
              <input className="input" placeholder="Full name" value={p2} onChange={e => { setP2(e.target.value); setError(""); }} />
            </div>
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label className="label">Group</label>
              <select className="select" value={group} onChange={e => setGroup(e.target.value)}>
                {groupLabels.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Skill Level</label>
              <select className="select" value={level} onChange={e => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Professional</option>
              </select>
            </div>
          </div>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "oklch(0.55 0.20 25 / 0.15)", border: "1px solid oklch(0.55 0.20 25 / 0.4)", fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          )}
        </div>

        <div className="row gap-3" style={{ marginTop: 26 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSubmit}>{I.check} Register Team</button>
        </div>
      </div>
    </div>
  );
}

export function EditTeamModal({ team, onClose, groupLabels = ["A", "B", "C"] }) {
  const { updateTeam } = React.useContext(MatchesContext);
  const GROUP_COLORS = { A: "blue", B: "green", C: "purple", D: "gold" };

  const [name, setName]   = React.useState(team.name);
  const [p1, setP1]       = React.useState(team.p1);
  const [p2, setP2]       = React.useState(team.p2);
  const [group, setGroup] = React.useState(team.group);
  const [level, setLevel] = React.useState(team.level || "Beginner");
  const [error, setError] = React.useState("");

  const handleSave = () => {
    if (!name.trim())  return setError("Team name is required.");
    if (!p1.trim())    return setError("Player 1 name is required.");
    if (!p2.trim())    return setError("Player 2 name is required.");
    updateTeam(team.id, {
      name:  name.trim(),
      p1:    p1.trim(),
      p2:    p2.trim(),
      group,
      color: GROUP_COLORS[group] || "blue",
      level,
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        padding: 32, width: 480, maxWidth: "100%", position: "relative",
        background: "linear-gradient(180deg, oklch(0.22 0.025 252) 0%, oklch(0.16 0.022 252) 100%)",
        border: "1px solid var(--stroke-strong)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-pop), 0 0 60px -10px oklch(0 0 0 / 0.8)",
        overflow: "hidden",
      }}>
        <Spotlight left="-40px" top="-60px" color="var(--blue)" size={240} opacity={0.35}/>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="label">Edit Team · {team.id}</div>
            <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>Edit Team Details</h3>
          </div>
          <button className="btn sm ghost" onClick={onClose}>{I.close}</button>
        </div>

        <div className="col gap-4">
          <div>
            <label className="label">Team Name</label>
            <input className="input" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label className="label">Player 1</label>
              <input className="input" value={p1} onChange={e => { setP1(e.target.value); setError(""); }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Player 2</label>
              <input className="input" value={p2} onChange={e => { setP2(e.target.value); setError(""); }} />
            </div>
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label className="label">Group</label>
              <select className="select" value={group} onChange={e => setGroup(e.target.value)}>
                {groupLabels.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Skill Level</label>
              <select className="select" value={level} onChange={e => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Professional</option>
              </select>
            </div>
          </div>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "oklch(0.55 0.20 25 / 0.15)", border: "1px solid oklch(0.55 0.20 25 / 0.4)", fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          )}
        </div>

        <div className="row gap-3" style={{ marginTop: 26 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSave}>{I.check} Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export function BulkAddModal({ onClose, groupLabels = ["A", "B", "C"], teams = [] }) {
  const { addTeam } = React.useContext(MatchesContext);
  const GROUP_COLORS = { A: "blue", B: "green", C: "purple", D: "gold" };
  const LEVELS = ["Beginner", "Intermediate", "Professional"];
  const PLACEHOLDER = `Team Name, Player 1, Player 2, Group, Level
Thunder Hawks, Aarav Mehta, Priya Kapoor, A, Intermediate
Smash Bandits, Rahul Sharma, Neha Singh, B, Beginner
Court Kings, Kabir Joshi, Anita Rao, A, Professional`;

  const [csv, setCsv] = React.useState("");
  const [error, setError] = React.useState("");

  const parseLevel = (raw) => {
    const s = (raw || "").trim().toLowerCase();
    if (s.startsWith("pro"))    return "Professional";
    if (s.startsWith("inter"))  return "Intermediate";
    return "Beginner";
  };

  const parseGroup = (raw) => {
    const s = (raw || "").trim().toUpperCase();
    return groupLabels.includes(s) ? s : groupLabels[0];
  };

  const parsed = csv.split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const [name, p1, p2, group, level] = line.split(",").map(s => s?.trim());
      return { name, p1, p2, group: parseGroup(group), level: parseLevel(level) };
    })
    .filter(t => t.name && t.p1 && t.p2);

  const handleAdd = () => {
    if (parsed.length === 0) return setError("No valid rows found. Check the format.");
    parsed.forEach((t, i) => {
      const id = `T${String(teams.length + i + 1).padStart(2, "0")}`;
      addTeam({ id, name: t.name, p1: t.p1, p2: t.p2, group: t.group, color: GROUP_COLORS[t.group] || "blue", level: t.level });
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ padding: 32, width: 560, maxWidth: "100%", position: "relative", background: "linear-gradient(180deg, oklch(0.22 0.025 252) 0%, oklch(0.16 0.022 252) 100%)", border: "1px solid var(--stroke-strong)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop), 0 0 60px -10px oklch(0 0 0 / 0.8)", overflow: "hidden" }}>
        <Spotlight left="-40px" top="-60px" color="var(--blue)" size={240} opacity={0.35}/>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div className="label">Bulk Registration</div>
            <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>Bulk Add Teams</h3>
          </div>
          <button className="btn sm ghost" onClick={onClose}>{I.close}</button>
        </div>

        <div className="mono" style={{ fontSize: 11.5, color: "var(--text-low)", marginBottom: 14 }}>
          One team per line: <span style={{ color: "var(--text-mid)" }}>Team Name, Player 1, Player 2, Group, Level</span>
        </div>

        <textarea
          className="input"
          style={{ width: "100%", minHeight: 160, fontFamily: "var(--font-mono)", fontSize: 12.5, resize: "vertical", padding: 12 }}
          placeholder={PLACEHOLDER}
          value={csv}
          onChange={e => { setCsv(e.target.value); setError(""); }}
        />

        {parsed.length > 0 && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "oklch(0.84 0.22 145 / 0.08)", border: "1px solid oklch(0.84 0.22 145 / 0.3)" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--green)", marginBottom: 8 }}>{I.check} {parsed.length} team{parsed.length !== 1 ? "s" : ""} ready to import</div>
            <div className="col gap-1">
              {parsed.map((t, i) => (
                <div key={i} className="row gap-3" style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--text-hi)", fontWeight: 500, minWidth: 140 }}>{t.name}</span>
                  <span style={{ color: "var(--text-mid)" }}>{t.p1} · {t.p2}</span>
                  <span className="badge" style={{ marginLeft: "auto" }}>Group {t.group}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>{t.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div style={{ marginTop: 10, fontSize: 13, color: "var(--red)" }}>⚠ {error}</div>}

        <div className="row gap-3" style={{ marginTop: 20 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 1 }} disabled={parsed.length === 0} onClick={handleAdd}>
            {I.plus} Add {parsed.length > 0 ? `${parsed.length} Team${parsed.length !== 1 ? "s" : ""}` : "Teams"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------- SETTINGS ---------------
export function SettingsScreen({ info, setTweak }) {
  const { resetMatches } = React.useContext(MatchesContext);
  const groups       = info?.numGroups    ?? 3;
  const pwin         = info?.pwin         ?? 3;
  const plos         = info?.plos         ?? 0;
  const setTo        = info?.setTo        ?? 15;
  const allowTwoPoint = info?.allowTwoPoint ?? true;
  const bo3semi      = info?.bo3semi      ?? true;
  const bo3final     = info?.bo3final     ?? true;
  const [saved, setSaved] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Configuration"
        title="Tournament Settings"
        sub="Tournament details, format rules, scoring, and tie-breaker logic — applied to every match in real time."
      />

      <div className="grid-12">
        <div style={{ gridColumn: "span 7" }}>
          <SettingsBlock title="Tournament Details">
            <Field label="Tournament name">
              <input className="input" style={{ width: 280 }} value={info?.tournamentName || ""} onChange={e => setTweak("tournamentName", e.target.value)}/>
            </Field>
            <Field label="Date" hint="Single-day tournament">
              <input className="input" style={{ width: 280 }} value={info?.tournamentDate || ""} onChange={e => setTweak("tournamentDate", e.target.value)}/>
            </Field>
            <Field label="Start time">
              <input className="input mono" style={{ width: 120, textAlign: "center" }} value={info?.tournamentStart || ""} onChange={e => setTweak("tournamentStart", e.target.value)}/>
            </Field>
            <Field label="End time">
              <input className="input mono" style={{ width: 120, textAlign: "center" }} value={info?.tournamentEnd || ""} onChange={e => setTweak("tournamentEnd", e.target.value)}/>
            </Field>
            <Field label="Number of courts" hint="How many courts can run matches in parallel">
              <div className="seg">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} className={(info?.numCourts || 2) === n ? "active" : ""} onClick={() => setTweak("numCourts", n)}>{n}</button>
                ))}
              </div>
            </Field>
            <Field label="Court names" hint="Name each court for display across all pages">
              <div className="col gap-2">
                {Array.from({ length: info?.numCourts ?? 2 }, (_, i) => (
                  <div key={i} className="row gap-2" style={{ alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-low)", width: 20 }}>{i + 1}</span>
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      value={(info?.courtNames ?? [])[i] ?? `Court ${i + 1}`}
                      placeholder={`Court ${i + 1}`}
                      onChange={e => {
                        const next = [...(info?.courtNames ?? Array.from({ length: info?.numCourts ?? 2 }, (_, j) => `Court ${j + 1}`))];
                        next[i] = e.target.value;
                        setTweak("courtNames", next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Field>
          </SettingsBlock>

          <SettingsBlock title="Structure">
            <Field label="Number of groups">
              <div className="seg">
                {[2, 3, 4].map(n => (
                  <button key={n} className={groups === n ? "active" : ""} onClick={() => setTweak("numGroups", n)}>{n} Groups</button>
                ))}
              </div>
            </Field>
            <Field label="Group stage format" hint="One set, first to N">
              <div className="row gap-3">
                <span className="mono" style={{ fontSize: 11, color: "var(--text-low)", width: 40 }}>1 set</span>
                <input type="range" min="11" max="25" value={setTo} onChange={e => setTweak("setTo", +e.target.value)} style={{ flex: 1, accentColor: "oklch(0.74 0.18 238)" }}/>
                <span className="mono" style={{ fontSize: 18, color: "var(--text-hi)", width: 48 }}>{setTo}</span>
              </div>
            </Field>
            <Field label="Allow two-point margin" hint="Match continues past target until +2 lead">
              <Toggle on={allowTwoPoint} onChange={v => setTweak("allowTwoPoint", v)}/>
            </Field>
          </SettingsBlock>

          <SettingsBlock title="Scoring & Points">
            <Field label="Points for win">
              <Stepper v={pwin} setV={v => setTweak("pwin", v)} />
            </Field>
            <Field label="Points for loss">
              <Stepper v={plos} setV={v => setTweak("plos", v)} />
            </Field>
            <Field label="Tie-breaker formula" hint="Sum of (points scored − points conceded) across all matches">
              <code className="mono" style={{ display: "block", padding: 12, borderRadius: 8, background: "oklch(0 0 0 / 0.4)", color: "var(--green)", fontSize: 12.5 }}>
                TB = Σ (pts_for - pts_against)
              </code>
            </Field>
          </SettingsBlock>

          <SettingsBlock title="Knockouts">
            <Field label="Semi Final · Best of 3"><Toggle on={bo3semi} onChange={v => setTweak("bo3semi", v)}/></Field>
            <Field label="Final · Best of 3"><Toggle on={bo3final} onChange={v => setTweak("bo3final", v)}/></Field>
            <Field label="Third-place match" hint="Bronze match between the two losing semi-finalists">
              <Toggle on={!!info?.thirdPlace} onChange={v => setTweak("thirdPlace", v)}/>
            </Field>
          </SettingsBlock>
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <div className="glass" style={{ padding: 22, position: "sticky", top: 36 }}>
            <div className="label" style={{ marginBottom: 12 }}>Preview · Current Format</div>
            <div className="col gap-3">
              <Preview k="Groups" v={`${groups} groups · 4 teams each`}/>
              <Preview k="Group matches" v={`1 set to ${setTo}${allowTwoPoint ? " (2pt margin)" : ""}`}/>
              <Preview k="Scoring" v={`Win ${pwin} · Loss ${plos}`}/>
              <Preview k="Tie-breaker" v={`Net point differential`}/>
              <Preview k="Semi Final" v={bo3semi ? `Best of 3 · to ${setTo}` : `1 set to ${setTo}`}/>
              <Preview k="Final" v={bo3final ? `Best of 3 · to ${setTo}` : `1 set to ${setTo}`}/>
            </div>
            <div className="h-divider"/>
            <button className="btn primary live-glow" style={{ width: "100%" }} onClick={handleSave}>
              {saved ? <>{I.check} Saved!</> : <>{I.check} Save Configuration</>}
            </button>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-low)", marginTop: 12, textAlign: "center" }}>Changes apply to upcoming matches only.</div>
            <div className="h-divider" style={{ marginTop: 16 }}/>
            {!confirmReset ? (
              <button className="btn ghost" style={{ width: "100%", color: "var(--red)", borderColor: "oklch(0.55 0.20 25 / 0.4)", marginTop: 4 }} onClick={() => setConfirmReset(true)}>
                {I.refresh} Reset Tournament Schedule
              </button>
            ) : (
              <div style={{ padding: "14px", borderRadius: 12, background: "oklch(0.55 0.20 25 / 0.10)", border: "1px solid oklch(0.55 0.20 25 / 0.35)", marginTop: 4 }}>
                <div style={{ fontSize: 13, color: "var(--text-hi)", marginBottom: 12 }}>Delete all matches? Teams and groups will be kept.</div>
                <div className="row gap-2">
                  <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>Cancel</button>
                  <button className="btn sm" style={{ flex: 1, background: "oklch(0.55 0.20 25 / 0.25)", borderColor: "oklch(0.55 0.20 25 / 0.5)", color: "var(--red)" }}
                    onClick={() => { resetMatches(); setConfirmReset(false); }}>
                    {I.trash} Delete All Matches
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsBlock({ title, children }) {
  return (
    <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
      <div className="display" style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)", marginBottom: 18 }}>{title}</div>
      <div className="col gap-4">{children}</div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: "var(--text-hi)", fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "var(--text-low)", marginTop: 4 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 999,
      background: on ? "var(--blue)" : "oklch(0 0 0 / 0.4)",
      border: "1px solid var(--stroke)",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s ease",
      boxShadow: on ? "0 0 12px oklch(0.74 0.18 238 / 0.5)" : "none",
    }}>
      <span style={{
        position: "absolute",
        top: 2, left: on ? 22 : 2,
        width: 18, height: 18, borderRadius: 999,
        background: "white",
        transition: "left 0.2s ease",
      }}/>
    </button>
  );
}

export function Stepper({ v, setV }) {
  return (
    <div className="row" style={{ border: "1px solid var(--stroke)", borderRadius: 999, padding: 2 }}>
      <button className="btn sm ghost" style={{ minWidth: 32 }} onClick={() => setV(Math.max(0, v - 1))}>−</button>
      <span className="mono" style={{ minWidth: 36, textAlign: "center", color: "var(--text-hi)", fontSize: 14 }}>{v}</span>
      <button className="btn sm ghost" style={{ minWidth: 32 }} onClick={() => setV(v + 1)}>+</button>
    </div>
  );
}

export function Preview({ k, v }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed oklch(1 0 0 / 0.06)" }}>
      <span className="label" style={{ margin: 0 }}>{k}</span>
      <span style={{ fontSize: 13, color: "var(--text-hi)", fontWeight: 500 }}>{v}</span>
    </div>
  );
}

