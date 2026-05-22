import React, { useState, useEffect, useRef } from "react";
import { I, ShuttleField } from "./components.jsx";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakText,
  TweakToggle,
  TweakRadio,
  TweakSlider,
  TweakButton,
} from "./tweaks.jsx";
import {
  LandingScreen,
  LoginScreen,
  DashboardScreen,
  TeamsScreen,
  SettingsScreen,
} from "./screens1.jsx";
import {
  GroupsScreen,
  SchedulerScreen,
  ResultsScreen,
  PointsScreen,
  BracketScreen,
  PublicScreen,
} from "./screens2.jsx";
import { MATCHES as MATCHES_INITIAL, TEAMS as TEAMS_INITIAL } from "./data.js";
import { MatchesContext } from "./MatchesContext.js";

const NAV = [
  { id: "landing",   label: "Home",          icon: I.public,   group: "Public" },
  { id: "public",    label: "Spectator",     icon: I.eye,      group: "Public" },
  { id: "dashboard", label: "Dashboard",     icon: I.dashboard, group: "Admin" },
  { id: "teams",     label: "Teams",         icon: I.teams,    group: "Admin" },
  { id: "groups",    label: "Groups",        icon: I.groups,   group: "Admin" },
  { id: "schedule",  label: "Schedule",      icon: I.schedule, group: "Admin" },
  { id: "live",      label: "Score Matches", icon: I.live,     group: "Admin" },
  { id: "points",    label: "Points Table",  icon: I.table,    group: "Admin" },
  { id: "bracket",   label: "Bracket",       icon: I.bracket,  group: "Admin" },
  { id: "settings",  label: "Settings",      icon: I.settings, group: "Admin" },
  { id: "login",     label: "Admin Login",   icon: I.login,    group: "Auth" },
];

const TWEAKS_DEFAULT = {
  accent: "blue",
  showShuttles: true,
  showArenaGrid: true,
  compactNav: false,
  tournamentName: "Turtlemint Badminton Tournament",
  tournamentDate: "Saturday, 14 November 2026",
  tournamentStart: "09:00",
  tournamentEnd: "19:00",
  numCourts: 2,
  courtNames: ["Court 1", "Court 2", "Court 3", "Court 4"],
  thirdPlace: false,
  setTo: 15,
  allowTwoPoint: true,
  numGroups: 3,
  pwin: 3,
  plos: 0,
  bo3semi: true,
  bo3final: true,
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");

  const login  = () => { localStorage.setItem("isAdmin", "true");  setIsAdmin(true); };
  const logout = () => { localStorage.removeItem("isAdmin");        setIsAdmin(false); };
  const [t, setTweak] = useTweaks(TWEAKS_DEFAULT);
  const [matches, setMatches] = useState(() => {
    try { const s = localStorage.getItem("tournament_matches"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [teams, setTeams] = useState(() => {
    try { const s = localStorage.getItem("tournament_teams"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [groupStageLocked, setGroupStageLocked] = useState(() =>
    localStorage.getItem("tournament_group_locked") === "true"
  );

  const lockGroupStage   = () => { localStorage.setItem("tournament_group_locked", "true");  setGroupStageLocked(true); };
  const unlockGroupStage = () => { localStorage.removeItem("tournament_group_locked");        setGroupStageLocked(false); };

  // Auto-clear stale lock if group matches are no longer all done
  useEffect(() => {
    if (!groupStageLocked) return;
    const groupMatches = matches.filter(m => m.stage === "group");
    const allDone = groupMatches.length > 0 && groupMatches.every(m => m.status === "done");
    if (!allDone) unlockGroupStage();
  }, [matches, groupStageLocked]);

  const [tournamentComplete, setTournamentComplete] = useState(() =>
    localStorage.getItem("tournament_complete") === "true"
  );
  const completeTournament   = () => { localStorage.setItem("tournament_complete", "true");  setTournamentComplete(true); };
  const reopenTournament     = () => { localStorage.removeItem("tournament_complete");        setTournamentComplete(false); };

  // Persist to localStorage on every change (instant, no server needed)
  useEffect(() => {
    localStorage.setItem("tournament_matches", JSON.stringify(matches));
    fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(matches) }).catch(() => {});
  }, [matches]);
  useEffect(() => {
    localStorage.setItem("tournament_teams", JSON.stringify(teams));
    fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teams) }).catch(() => {});
  }, [teams]);

  const updateMatch = (id, patch) =>
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));

  const reorderMatches = (fromId, toId) =>
    setMatches(prev => {
      const result = [...prev];
      const fromIdx = result.findIndex(m => m.id === fromId);
      const toIdx   = result.findIndex(m => m.id === toId);
      if (fromIdx === toIdx) return prev;
      const [moved] = result.splice(fromIdx, 1);
      result.splice(toIdx, 0, moved);
      // Renumber group matches sequentially after reorder
      let n = 0;
      return result.map(m =>
        m.stage === "group" ? { ...m, id: `M${String(++n).padStart(2, "0")}` } : m
      );
    });

  const addMatches   = (newMatches) => setMatches(prev => [...prev, ...newMatches]);
  const resetMatches = () => setMatches([]);

  const addTeam    = (team)       => setTeams(prev => [...prev, team]);
  const updateTeam = (id, patch)  => setTeams(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  const removeTeam = (id)         => setTeams(prev => prev.filter(t => t.id !== id));

  // Auto-populate knockout bracket
  useEffect(() => {
    const groupMatches = matches.filter(m => m.stage === "group");
    const semiMatches  = matches.filter(m => m.stage === "semi");
    const finalMatch   = matches.find(m => m.id === "FNL"); // explicitly target the Final, not 3RD

    const groupDone = groupMatches.length > 0 && groupMatches.every(m => m.status === "done");

    // --- Step 1: Create SF/FNL placeholder entries if they don't exist ---
    if (groupDone && groupStageLocked && semiMatches.length === 0) {
      const numCourts = t.numCourts ?? 2;
      setMatches(prev => [
        ...prev,
        { id: "SF1", a: "?", b: "?", group: "—", stage: "semi",  court: 1,                    time: "15:00", status: "upcoming", sets: [], winner: null },
        { id: "SF2", a: "?", b: "?", group: "—", stage: "semi",  court: Math.min(2, numCourts), time: "15:00", status: "upcoming", sets: [], winner: null },
        ...(t.thirdPlace ? [{ id: "3RD", a: "?", b: "?", group: "—", stage: "final", court: 1, time: "17:00", status: "upcoming", sets: [], winner: null, thirdPlace: true }] : []),
        { id: "FNL", a: "?", b: "?", group: "—", stage: "final", court: 1,                    time: "17:30", status: "upcoming", sets: [], winner: null },
      ]);
      return;
    }

    // --- Step 1b: Add 3RD if thirdPlace enabled but 3RD missing (FNL already exists) ---
    const hasFNL = matches.some(m => m.id === "FNL");
    const has3RD = matches.some(m => m.id === "3RD");
    if (t.thirdPlace && hasFNL && !has3RD) {
      setMatches(prev => {
        const idx = prev.findIndex(m => m.id === "FNL");
        const result = [...prev];
        result.splice(idx, 0, { id: "3RD", a: "?", b: "?", group: "—", stage: "final", court: 1, time: "17:00", status: "upcoming", sets: [], winner: null, thirdPlace: true });
        return result;
      });
      return;
    }

    // --- Step 2: Populate semis with qualified teams ---
    const semisNeedFilling = semiMatches.some(m => m.a === "?" || m.b === "?");

    if (groupDone && semisNeedFilling && semiMatches.length >= 2) {
      const pwin = t.pwin ?? 3, plos = t.plos ?? 0;
      const groups = [...new Set(groupMatches.map(m => m.group))].sort();

      const standingsPerGroup = groups.map(g => {
        const gTeams = teams.filter(tm => tm.group === g);
        return gTeams.map(tm => {
          const played = groupMatches.filter(m => m.a === tm.id || m.b === tm.id);
          let pts = 0, tb = 0;
          for (const m of played) {
            const isA = m.a === tm.id;
            if (m.winner === tm.id) pts += pwin; else pts += plos;
            const s = m.sets[0] || [0, 0];
            tb += Number(isA ? s[0] : s[1]) - Number(isA ? s[1] : s[0]);
          }
          return { id: tm.id, pts, tb };
        }).sort((a, b) => b.pts - a.pts || b.tb - a.tb);
      });

      // Cross-seeding: seed1 vs seed4, seed2 vs seed3
      const winners = standingsPerGroup.map(s => s[0]).filter(Boolean).sort((a, b) => b.pts - a.pts || b.tb - a.tb);
      const runners = standingsPerGroup.map(s => s[1]).filter(Boolean).sort((a, b) => b.pts - a.pts || b.tb - a.tb);

      setMatches(prev => prev.map(m => {
        if (m.id === semiMatches[0].id && (m.a === "?" || m.b === "?"))
          return { ...m, a: winners[0]?.id ?? "?", b: runners[1]?.id ?? runners[0]?.id ?? "?" };
        if (m.id === semiMatches[1].id && (m.a === "?" || m.b === "?"))
          return { ...m, a: winners[1]?.id ?? winners[0]?.id ?? "?", b: runners[0]?.id ?? "?" };
        return m;
      }));
    }

    // --- Step 3: Populate final when both semis are done ---
    const semisDone         = semiMatches.length > 0 && semiMatches.every(m => m.status === "done");
    const finalNeedsFilling = finalMatch && (finalMatch.a === "?" || finalMatch.b === "?");

    if (semisDone && finalNeedsFilling) {
      const [sf1, sf2] = semiMatches;
      if (sf1.winner && sf2.winner) {
        setMatches(prev => prev.map(m =>
          m.id === finalMatch.id ? { ...m, a: sf1.winner, b: sf2.winner } : m
        ));
      }
    }

    // --- Step 4: Populate 3rd place match when semis are done ---
    const thirdPlaceMatch = matches.find(m => m.id === "3RD");
    if (semisDone && thirdPlaceMatch && (thirdPlaceMatch.a === "?" || thirdPlaceMatch.b === "?")) {
      const [sf1, sf2] = semiMatches;
      const sf1Loser = sf1.winner === sf1.a ? sf1.b : sf1.a;
      const sf2Loser = sf2.winner === sf2.a ? sf2.b : sf2.a;
      if (sf1Loser && sf2Loser) {
        setMatches(prev => prev.map(m =>
          m.id === "3RD" ? { ...m, a: sf1Loser, b: sf2Loser } : m
        ));
      }
    }

    // --- Step 5: Auto-complete tournament when final is done ---
    if (finalMatch?.status === "done" && finalMatch?.winner && !tournamentComplete) {
      completeTournament();
    }
  }, [matches, teams, groupStageLocked]); // groupStageLocked triggers SF creation

  // Deduplicate any stale 3RD entries on mount
  useEffect(() => {
    const count3rd = matches.filter(m => m.id === "3RD").length;
    if (count3rd > 1) setMatches(prev => {
      let seen = false;
      return prev.filter(m => { if (m.id !== "3RD") return true; if (!seen) { seen = true; return true; } return false; });
    });
  }, []);

  // Add/remove 3rd place match when the setting is toggled
  useEffect(() => {
    const has3rd = matches.some(m => m.id === "3RD");
    if (t.thirdPlace && !has3rd) {
      // Insert 3RD before FNL in the array
      setMatches(prev => {
        const without  = prev.filter(m => m.stage !== "final");
        const finals   = prev.filter(m => m.stage === "final" && m.id !== "3RD"); // exclude any stale 3RD
        return [
          ...without,
          { id: "3RD", a: "?", b: "?", group: "—", stage: "final", court: 1, time: "17:00", status: "upcoming", sets: [], winner: null, thirdPlace: true },
          ...finals,
        ];
      });
    } else if (!t.thirdPlace && has3rd) {
      setMatches(prev => prev.filter(m => m.id !== "3RD"));
    }
  }, [t.thirdPlace]);

  // accent override on body
  useEffect(() => {
    const map = {
      blue:   { primary: "oklch(0.74 0.18 238)", glow: "oklch(0.78 0.21 238)" },
      green:  { primary: "oklch(0.78 0.20 150)", glow: "oklch(0.84 0.22 145)" },
      purple: { primary: "oklch(0.68 0.20 295)", glow: "oklch(0.74 0.20 290)" },
      gold:   { primary: "oklch(0.78 0.16 80)",  glow: "oklch(0.85 0.16 88)" },
    };
    const c = map[t.accent] || map.blue;
    document.documentElement.style.setProperty("--blue", c.primary);
    document.documentElement.style.setProperty("--blue-glow", c.glow);
  }, [t.accent]);

  const go = (id) => {
    setScreen(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MatchesContext.Provider value={{ matches, teams, updateMatch, reorderMatches, addTeam, updateTeam, removeTeam, addMatches, resetMatches, groupStageLocked, lockGroupStage, unlockGroupStage, tournamentComplete, completeTournament, reopenTournament, courtNames: t.courtNames ?? TWEAKS_DEFAULT.courtNames, setCourtName: (i, name) => { const next = [...(t.courtNames ?? TWEAKS_DEFAULT.courtNames)]; next[i] = name; setTweak("courtNames", next); } }}>
      {t.showArenaGrid && <div className="arena-bg"/>}
      {t.showShuttles && <ShuttleField/>}

      <TopBar screen={screen} go={go} info={t} isAdmin={isAdmin} onSignOut={() => { logout(); go("landing"); }}/>

      <div className="shell">
        {!t.compactNav && <SideNav screen={screen} go={go} isAdmin={isAdmin}/>}
        <div className="main" data-screen-label={screen}>
          {renderScreen(screen, go, t, setTweak, isAdmin, login)}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Tournament Details">
          <TweakText label="Name"   value={t.tournamentName}  onChange={v => setTweak("tournamentName", v)}/>
          <TweakText label="Date"   value={t.tournamentDate}  onChange={v => setTweak("tournamentDate", v)}/>
          <TweakText label="Starts" value={t.tournamentStart} onChange={v => setTweak("tournamentStart", v)}/>
          <TweakText label="Ends"   value={t.tournamentEnd}   onChange={v => setTweak("tournamentEnd", v)}/>
          <TweakSlider label="Courts" min={1} max={4} step={1} value={t.numCourts} onChange={v => setTweak("numCourts", v)}/>
        </TweakSection>
        <TweakSection title="Brand & Theme">
          <TweakRadio label="Accent" value={t.accent} onChange={v => setTweak("accent", v)}
            options={[
              { value: "blue",   label: "Blue" },
              { value: "green",  label: "Green" },
              { value: "purple", label: "Purple" },
              { value: "gold",   label: "Gold" },
            ]}/>
        </TweakSection>
        <TweakSection title="Ambient">
          <TweakToggle label="Drifting shuttles" value={t.showShuttles}  onChange={v => setTweak("showShuttles", v)}/>
          <TweakToggle label="Arena grid + glow" value={t.showArenaGrid} onChange={v => setTweak("showArenaGrid", v)}/>
        </TweakSection>
        <TweakSection title="Layout">
          <TweakToggle label="Compact (hide sidebar)" value={t.compactNav} onChange={v => setTweak("compactNav", v)}/>
        </TweakSection>
        <TweakSection title="Quick Jump">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {NAV.map(n => (
              <TweakButton key={n.id} label={n.label} onClick={() => go(n.id)}/>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </MatchesContext.Provider>
  );
}

function renderScreen(s, go, info, setTweak, isAdmin, login) {
  switch (s) {
    case "landing":   return <LandingScreen go={go} info={info}/>;
    case "login":     return <LoginScreen onLogin={() => { login(); go("dashboard"); }}/>;
    case "dashboard": return <DashboardScreen go={go} info={info} isAdmin={isAdmin}/>;
    case "teams":     return <TeamsScreen isAdmin={isAdmin} info={info}/>;
    case "groups":    return <GroupsScreen isAdmin={isAdmin} info={info}/>;
    case "schedule":  return <SchedulerScreen isAdmin={isAdmin} info={info}/>;
    case "live":      return <ResultsScreen info={info}/>;
    case "points":    return <PointsScreen info={info}/>;
    case "bracket":   return <BracketScreen/>;
    case "settings":  return <SettingsScreen info={info} setTweak={setTweak}/>;
    case "public":    return <PublicScreen info={info}/>;
    default:          return <LandingScreen go={go} info={info}/>;
  }
}

function TopBar({ screen, go, info, isAdmin, onSignOut }) {
  const { matches } = React.useContext(MatchesContext);
  const hasLiveMatch = matches.some(m => m.status === "live");
  const isWithinTournamentTime = () => {
    if (!info?.tournamentStart || !info?.tournamentEnd) return false;
    const now = new Date();
    const [sh, sm] = info.tournamentStart.split(":").map(Number);
    const [eh, em] = info.tournamentEnd.split(":").map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
  };
  const isLive = hasLiveMatch && isWithinTournamentTime();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      padding: "12px 24px",
      background: "linear-gradient(180deg, oklch(0.10 0.02 252 / 0.85), oklch(0.10 0.02 252 / 0.35))",
      backdropFilter: "blur(16px) saturate(140%)",
      borderBottom: "1px solid var(--stroke)",
    }}>
      <div className="row" style={{ maxWidth: 1480, margin: "0 auto", justifyContent: "space-between" }}>
        <div className="row gap-3" style={{ cursor: "pointer" }} onClick={() => go("landing")}>
          <img src="https://www.turtlemint.com/wp-content/uploads/turtlemint-logo-light.webp" alt="Turtlemint" style={{ height: 26, width: "auto", filter: "drop-shadow(0 0 10px oklch(0.78 0.20 150 / 0.4))" }}/>
          <span style={{ width: 1, height: 24, background: "var(--stroke)", margin: "0 4px" }}/>
          <div>
            <div className="display" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-hi)", lineHeight: 1, letterSpacing: "-0.005em" }}>Badminton Tournament Console</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-low)", letterSpacing: "0.18em", marginTop: 3 }}>{info?.tournamentDate || ""}</div>
          </div>
        </div>

        <div className="row gap-3">
          {isLive
            ? <span className="badge live"><span className="dot pulse"/>Tournament Live</span>
            : <span className="badge" style={{ color: "var(--text-mid)" }}>Tournament Not Started</span>
          }
          <span className="badge"><span className="mono">{info?.tournamentStart}–{info?.tournamentEnd}</span></span>
          <button className="btn sm" onClick={() => go("public")}>{I.eye} Spectator</button>
          {isAdmin ? (
            <div className="row gap-2">
              <span className="badge" style={{ color: "var(--green)", borderColor: "oklch(0.84 0.22 145 / 0.35)", background: "oklch(0.84 0.22 145 / 0.08)" }}><span className="dot" style={{ background: "var(--green)" }}/>Admin</span>
              <button className="btn sm ghost" onClick={onSignOut}>Sign out</button>
            </div>
          ) : screen === "login" ? (
            <button className="btn primary sm" onClick={() => go("dashboard")}>Sign in {I.chevron}</button>
          ) : (
            <button className="btn primary sm" onClick={() => go("login")}>{I.login} Admin Login</button>
          )}
        </div>
      </div>
    </div>
  );
}

function SideNav({ screen, go, isAdmin }) {
  const ADMIN_ONLY = new Set(["live", "settings"]);
  const visible = NAV.filter(n => {
    if (!isAdmin && ADMIN_ONLY.has(n.id)) return false;
    if (isAdmin && n.id === "login") return false;
    return true;
  });
  const grouped = visible.reduce((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <aside className="sidenav glass" style={{ borderRadius: 22 }}>
      {Object.entries(grouped).map(([g, items]) => (
        <div key={g} style={{ marginBottom: 8 }}>
          <div className="label" style={{ padding: "8px 12px 4px" }}>{g}</div>
          {items.map(item => (
            <div key={item.id} className={`nav-item ${screen === item.id ? "active" : ""}`} onClick={() => go(item.id)}>
              <span className="ico">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "live" && <span style={{ marginLeft: "auto" }}><span className="dot pulse" style={{ background: "var(--green)" }}/></span>}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: "auto", padding: "12px", borderTop: "1px solid var(--stroke)" }}>
        <div className="row gap-3">
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: isAdmin ? "linear-gradient(135deg, var(--green), var(--blue))" : "linear-gradient(135deg, oklch(0.4 0.04 250), oklch(0.3 0.04 250))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "oklch(0.12 0.02 250)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13
          }}>{isAdmin ? "RJ" : "·"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "var(--text-hi)", fontWeight: 500 }}>{isAdmin ? "Referee · R. Jain" : "Spectator"}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-low)" }}>{isAdmin ? "Hall Admin" : "Read-only access"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
