import React from "react";
import { TEAMS, findTeam, getTeamStats, validateFinalScore, getCourtName } from "./data.js";
import { MatchesContext } from "./MatchesContext.js";
import { I, TeamAvatar, GroupBadge, StageBadge, Spotlight, SectionTitle, ConfettiBurst } from "./components.jsx";
import { UpcomingRow } from "./screens1.jsx";

function computeStandings(matches, teams, group, pwin = 3, plos = 0) {
  const doneGroupMatches = matches.filter(
    m => m.stage === "group" && m.group === group && m.status === "done"
  );
  return teams.filter(t => t.group === group).map(t => {
    let wins = 0, losses = 0, pts = 0, tb = 0;
    for (const m of doneGroupMatches) {
      if (m.a !== t.id && m.b !== t.id) continue;
      const isA = m.a === t.id;
      const won = m.winner === t.id;
      const set = m.sets[0] || [0, 0];
      const pf = Number(isA ? set[0] : set[1]);
      const pa = Number(isA ? set[1] : set[0]);
      if (won) { wins += 1; pts += pwin; } else { losses += 1; pts += plos; }
      tb += pf - pa;
    }
    return { ...t, wins, losses, pts, tb };
  }).sort((a, b) => b.pts - a.pts || b.tb - a.tb);
}

// =================== SCREENS PART 2 ===================
// Groups, Scheduler, Live scoring, Points, Bracket, Public

// --------------- GROUPS ---------------
export function GroupsScreen({ isAdmin, info }) {
  const { matches, teams, updateTeam } = React.useContext(MatchesContext);
  const ALL_LABELS = ["A", "B", "C", "D"];
  const GROUP_COLORS = { A: "blue", B: "green", C: "purple", D: "gold" };
  const groups = ALL_LABELS.slice(0, info?.numGroups ?? 3);
  const [dragging, setDragging] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  // editingGroup: { key, name } — null when not editing
  const [editingGroup, setEditingGroup] = React.useState(null);
  const [groupNames, setGroupNames] = React.useState(() =>
    Object.fromEntries(ALL_LABELS.map(l => [l, `Group ${l}`]))
  );

  const handleDrop = (e, targetGroup) => {
    e.preventDefault();
    if (dragging && targetGroup) {
      updateTeam(dragging, { group: targetGroup, color: GROUP_COLORS[targetGroup] || "blue" });
    }
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div>
      <SectionTitle
        eyebrow={`Group Assignment${isAdmin ? "" : " · Read-only"}`}
        title={isAdmin ? "Compose the Group Stage" : "Groups"}
        sub={isAdmin ? "Drag teams between groups to reassign them." : "Group composition and current mini standings."}
      />

      <div className="grid-12">
        {groups.map(g => {
          const inGroup = teams.filter(t => t.group === g);
          const isTarget = dragOver === g && dragging !== null;
          const colSpan = Math.floor(12 / groups.length);
          return (
            <div
              key={g}
              style={{ gridColumn: `span ${colSpan}` }}
              onDragOver={e => { e.preventDefault(); setDragOver(g); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, g)}
            >
              <div className={`glass group-tint-${g}`} style={{
                padding: 18,
                border: isTarget ? "1px solid var(--blue)" : "1px solid var(--stroke)",
                boxShadow: isTarget ? "0 0 0 4px oklch(0.74 0.18 238 / 0.18)" : "var(--shadow-card)",
                transition: "all 0.2s ease",
                background: isTarget ? "oklch(0.74 0.18 238 / 0.06)" : undefined,
              }}>
                {/* Header */}
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
                  {editingGroup?.key === g ? (
                    <input
                      autoFocus
                      className="input"
                      style={{ fontSize: 12, padding: "4px 8px", height: 28, width: 120 }}
                      value={editingGroup.name}
                      onChange={e => setEditingGroup({ key: g, name: e.target.value })}
                      onBlur={() => { setGroupNames(prev => ({ ...prev, [g]: editingGroup.name || `Group ${g}` })); setEditingGroup(null); }}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") e.target.blur(); }}
                    />
                  ) : (
                    <div className="row gap-2">
                      <GroupBadge g={g}/>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)" }}>{groupNames[g]}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>· {inGroup.length} teams</span>
                    </div>
                  )}
                  {isAdmin && !editingGroup && (
                    <button className="btn sm ghost" onClick={() => setEditingGroup({ key: g, name: groupNames[g] })}>{I.edit}</button>
                  )}
                </div>

                {/* Team rows */}
                <div className="col gap-2" style={{ marginBottom: 14, minHeight: 40 }}>
                  {inGroup.length === 0 && (
                    <div style={{ padding: "10px 0", textAlign: "center", fontSize: 12, color: "var(--text-low)", borderRadius: 8, border: "1px dashed var(--stroke)" }}>
                      Drop teams here
                    </div>
                  )}
                  {inGroup.map(t => (
                    <div
                      key={t.id}
                      draggable={isAdmin}
                      onDragStart={() => isAdmin && setDragging(t.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      className="glass-thin"
                      style={{
                        padding: 10,
                        display: "flex", alignItems: "center", gap: 12,
                        cursor: isAdmin ? "grab" : "default",
                        opacity: dragging === t.id ? 0.4 : 1,
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      {isAdmin && <span style={{ color: "var(--text-low)" }}>{I.drag}</span>}
                      <TeamAvatar team={t} size={32}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--text-hi)", fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-low)" }}>{t.p1.split(" ")[0]} · {t.p2.split(" ")[0]}</div>
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>{t.level || "—"}</span>
                    </div>
                  ))}
                </div>

                {/* Mini standings */}
                <div className="label" style={{ marginBottom: 8 }}>Mini Standings</div>
                <div className="col gap-2">
                  {computeStandings(matches, teams, g, info?.pwin ?? 3, info?.plos ?? 0).map((t, i) => (
                    <div key={t.id} className="row" style={{ fontSize: 12.5, padding: "4px 0" }}>
                      <span className="mono" style={{ width: 22, color: i < 2 ? "var(--green)" : "var(--text-low)" }}>{i + 1}</span>
                      <span style={{ flex: 1, color: "var(--text-hi)" }}>{t.name}</span>
                      <span className="mono" style={{ color: "var(--text-mid)" }}>{t.wins}–{t.losses}</span>
                      <span className="mono" style={{ width: 38, textAlign: "right", color: "var(--text-hi)" }}>{t.pts} pts</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-low)", fontFamily: "var(--font-mono)" }}>
                  Top 2 advance to knockouts
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------- SCHEDULER ---------------
export function SchedulerScreen({ isAdmin, info }) {
  const { matches: MATCHES, teams, addMatches } = React.useContext(MatchesContext);
  const [sel, setSel] = React.useState("all");
  const [genOpen, setGenOpen] = React.useState(false);
  const numCourts = info?.numCourts ?? 2;

  // 3RD match is now a real entry in state (added/removed by App.jsx when setting toggles)
  const group  = MATCHES.filter(m => m.stage === "group");
  const semis  = MATCHES.filter(m => m.stage === "semi");
  const finals = MATCHES.filter(m => m.stage === "final"); // includes 3RD if enabled
  const showSection = (key) => sel === "all" || sel === key;
  const hasGroupMatches = group.length > 0;

  return (
    <div>
      <SectionTitle
        eyebrow={`Match Scheduler${isAdmin ? "" : " · Read-only"}`}
        title={isAdmin ? "Match Queue" : "Schedule"}
        sub={isAdmin ? "Group, semi-final and final stages — drag to reorder within a stage." : "Full match schedule for the day."}
        right={
          <div className="row gap-3">
            <div className="seg">
              <button className={sel === "all" ? "active" : ""} onClick={() => setSel("all")}>All</button>
              <button className={sel === "group" ? "active" : ""} onClick={() => setSel("group")}>Group</button>
              <button className={sel === "semi" ? "active" : ""} onClick={() => setSel("semi")}>Semi</button>
              <button className={sel === "final" ? "active" : ""} onClick={() => setSel("final")}>Final</button>
            </div>
            {isAdmin && (
              <button className="btn primary sm" onClick={() => setGenOpen(true)}>
                {I.schedule} Generate Group Schedule
              </button>
            )}
          </div>
        }
      />

      {isAdmin && teams.length > 0 && !hasGroupMatches && (
        <div className="glass-thin" style={{ padding: 20, marginBottom: 18, borderStyle: "dashed", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 10 }}>
            No group matches scheduled yet. Generate the round-robin schedule to get started.
          </div>
          <button className="btn primary sm" onClick={() => setGenOpen(true)}>
            {I.schedule} Generate Group Stage Schedule
          </button>
        </div>
      )}

      <div className="col gap-4">
        {showSection("group") && (
          <StageTable title="Group Stage" subtitle="Top 2 from each group advance." accent="var(--text-mid)" matches={group} isAdmin={isAdmin} numCourts={numCourts}/>
        )}
        {showSection("semi") && (
          <StageTable title="Semi Finals" subtitle="Best of 3. Winners advance to the Final." accent="var(--purple)" matches={semis} isAdmin={isAdmin}/>
        )}
        {showSection("final") && finals.length > 0 && (
          <StageTable
            title="Finals Zone"
            subtitle={MATCHES.some(m => m.id === "3RD") ? "Bronze (3rd place) match plays first, then the Final." : "The gold-court final."}
            accent="var(--gold)"
            matches={finals}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {genOpen && (
        <GenerateScheduleModal
          teams={teams}
          info={info}
          existingMatches={MATCHES}
          onClose={() => setGenOpen(false)}
          onGenerate={(newMatches) => { addMatches(newMatches); setGenOpen(false); }}
        />
      )}
    </div>
  );
}

export function GenerateScheduleModal({ teams, info, existingMatches, onClose, onGenerate }) {
  const ALL_LABELS = ["A", "B", "C", "D"];
  const numGroups  = info?.numGroups ?? 3;
  const groups     = ALL_LABELS.slice(0, numGroups);
  const numCourts  = info?.numCourts ?? 2;

  const [duration, setDuration]     = React.useState(30);
  const [startTime, setStartTime]   = React.useState(info?.tournamentStart || "09:00");
  const [overwrite, setOverwrite]   = React.useState(false);

  const addMinutes = (time, mins) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const generateMatches = () => {
    // Assign each group to a fixed court: Group A→Court 1, Group B→Court 2, etc.
    // Groups beyond numCourts wrap around (Group C→Court 1 if only 2 courts)
    const groupCourtMap = Object.fromEntries(
      groups.map((g, i) => [g, (i % numCourts) + 1])
    );

    // Generate round-robin pairs per group
    const byGroup = {};
    groups.forEach(g => {
      const gt = teams.filter(t => t.group === g);
      byGroup[g] = [];
      for (let i = 0; i < gt.length; i++)
        for (let j = i + 1; j < gt.length; j++)
          byGroup[g].push({ a: gt[i].id, b: gt[j].id, group: g });
    });

    // Interleave: pick one match from each group in turn so courts run in parallel
    // Each court tracks its own slot index independently
    const courtSlot = {};
    const result = [];
    let globalIdx = 0;
    const maxRounds = Math.max(...groups.map(g => byGroup[g].length));

    for (let round = 0; round < maxRounds; round++) {
      groups.forEach(g => {
        if (round >= byGroup[g].length) return;
        const court = groupCourtMap[g];
        if (courtSlot[court] === undefined) courtSlot[court] = 0;
        const p = byGroup[g][round];
        result.push({
          a: p.a, b: p.b, group: g,
          court,
          time: addMinutes(startTime, courtSlot[court] * duration),
        });
        courtSlot[court]++;
        globalIdx++;
      });
    }

    const offset = overwrite ? 0 : existingMatches.filter(m => m.stage === "group").length;
    return result.map((p, i) => ({
      id:     `M${String(offset + i + 1).padStart(2, "0")}`,
      a:      p.a,
      b:      p.b,
      group:  p.group,
      stage:  "group",
      court:  p.court,
      time:   p.time,
      status: "upcoming",
      sets:   [],
      winner: null,
    }));
  };

  const preview = generateMatches();
  const groupCounts = groups.map(g => ({
    g,
    teams: teams.filter(t => t.group === g).length,
    matches: preview.filter(m => m.group === g).length,
  }));

  const existingGroupMatches = existingMatches.filter(m => m.stage === "group").length;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ padding: 32, width: 520, maxWidth: "100%", position: "relative", background: "linear-gradient(180deg, oklch(0.22 0.025 252) 0%, oklch(0.16 0.022 252) 100%)", border: "1px solid var(--stroke-strong)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop), 0 0 60px -10px oklch(0 0 0 / 0.8)" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="label">Round-Robin</div>
            <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>Generate Group Schedule</h3>
          </div>
          <button className="btn sm ghost" onClick={onClose}>{I.close}</button>
        </div>

        {/* Group summary */}
        <div className="col gap-2" style={{ marginBottom: 18 }}>
          {groupCounts.map(({ g, teams: tc, matches: mc }, gi) => (
            <div key={g} className="row" style={{ padding: "8px 12px", borderRadius: 10, background: "oklch(1 0 0 / 0.04)", border: "1px solid var(--stroke)" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--text-mid)", width: 70 }}>Group {g}</span>
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-hi)" }}>{tc} team{tc !== 1 ? "s" : ""}</span>
              <span className="badge" style={{ marginRight: 8 }}>Court {(gi % numCourts) + 1}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>{mc} match{mc !== 1 ? "es" : ""}</span>
            </div>
          ))}
        </div>

        {/* Config */}
        <div className="col gap-3" style={{ marginBottom: 18 }}>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <label className="label">Start Time</label>
              <input className="input mono" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Match Duration (min)</label>
              <input className="input mono" type="number" min="10" max="120" value={duration} onChange={e => setDuration(Number(e.target.value))} />
            </div>
          </div>
          {existingGroupMatches > 0 && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "oklch(0.78 0.16 80 / 0.10)", border: "1px solid oklch(0.78 0.16 80 / 0.35)", fontSize: 13, color: "var(--gold)" }}>
              ⚠ {existingGroupMatches} group match{existingGroupMatches !== 1 ? "es" : ""} already exist. New matches will be appended.
            </div>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 10, background: "oklch(0.84 0.22 145 / 0.08)", border: "1px solid oklch(0.84 0.22 145 / 0.3)", fontSize: 13, color: "var(--text-mid)", marginBottom: 20 }}>
          {I.check} <strong style={{ color: "var(--text-hi)" }}>{preview.length} matches</strong> will be generated across {numCourts} court{numCourts !== 1 ? "s" : ""}, ending around <span className="mono">{preview.length > 0 ? preview[preview.length - 1].time : startTime}</span>.
        </div>

        <div className="row gap-3">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 1 }} disabled={preview.length === 0} onClick={() => onGenerate(preview)}>
            {I.schedule} Generate {preview.length} Matches
          </button>
        </div>
      </div>
    </div>
  );
}

export function StageTable({ title, subtitle, accent, matches, isAdmin, numCourts = 2 }) {
  const { reorderMatches } = React.useContext(MatchesContext);
  const [dragId, setDragId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop      = (e, toId) => {
    e.preventDefault();
    if (dragId && dragId !== toId) reorderMatches(dragId, toId);
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd   = () => { setDragId(null); setDragOverId(null); };

  if (matches.length === 0) {
    return (
      <div className="glass" style={{ padding: 20, opacity: 0.6 }}>
        <div className="display" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-mid)", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-low)" }}>No matches scheduled yet.</div>
      </div>
    );
  }
  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", borderTop: `2px solid ${accent}` }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between" }}>
        <div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-low)", marginTop: 2 }}>{subtitle}</div>
        </div>
        <div className="row gap-3">
          <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>{matches.length} match{matches.length === 1 ? "" : "es"}</span>
          {isAdmin && <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>· drag to reorder</span>}
        </div>
      </div>
      <div>
        {matches.map((m, i) => (
          <SchedRow
            key={m.id} m={m} idx={i} last={i === matches.length - 1} isAdmin={isAdmin} numCourts={numCourts}
            draggable={isAdmin && m.status === "upcoming"}
            isDragging={dragId === m.id}
            isDropTarget={dragOverId === m.id && dragId !== m.id}
            onDragStart={() => handleDragStart(m.id)}
            onDragOver={(e) => handleDragOver(e, m.id)}
            onDrop={(e) => handleDrop(e, m.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

export function SchedRow({ m, idx, last, isAdmin, numCourts = 2, draggable, isDragging, isDropTarget, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const { teams, updateMatch, courtNames } = React.useContext(MatchesContext);
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  const stageColor = {
    group: "transparent",
    semi: "var(--purple)",
    final: "var(--gold)",
  }[m.stage];
  const isThird = m.thirdPlace;
  return (
    <div
      className="row"
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      style={{
        gap: 14,
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid oklch(1 0 0 / 0.04)",
        position: "relative",
        cursor: draggable ? "grab" : "default",
        transition: "background 0.15s ease, opacity 0.15s",
        background: isDropTarget
          ? "oklch(0.74 0.18 238 / 0.10)"
          : isThird ? "oklch(0.70 0.18 25 / 0.04)" : "transparent",
        opacity: isDragging ? 0.35 : 1,
        outline: isDropTarget ? "2px solid var(--blue)" : "none",
        outlineOffset: -2,
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = isThird ? "oklch(0.70 0.18 25 / 0.06)" : "oklch(1 0 0 / 0.025)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = isDropTarget ? "oklch(0.74 0.18 238 / 0.10)" : isThird ? "oklch(0.70 0.18 25 / 0.04)" : "transparent"; }}
    >
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: isThird ? "oklch(0.65 0.13 50)" : stageColor, boxShadow: stageColor !== "transparent" || isThird ? `0 0 8px ${isThird ? "oklch(0.65 0.13 50)" : stageColor}` : "none" }}/>
      {isAdmin && <span style={{ color: draggable ? "var(--text-mid)" : "var(--text-low)", opacity: draggable ? 1 : 0.3 }}>{I.drag}</span>}
      <span className="mono" style={{ width: 36, fontSize: 11, color: "var(--text-low)" }}>{String(idx + 1).padStart(2, "0")}</span>
      <span className="mono" style={{ width: 44, fontSize: 12, color: "var(--text-mid)" }}>{m.time}</span>
      <div className="row gap-2" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <TeamAvatar team={a} size={26}/>
        <span style={{ fontSize: 13, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{a.name}</span>
        <span className="mono" style={{ color: "var(--text-low)", fontSize: 11, padding: "0 4px", flexShrink: 0 }}>vs</span>
        <TeamAvatar team={b} size={26}/>
        <span style={{ fontSize: 13, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{b.name}</span>
      </div>
      {isAdmin && m.status === "upcoming" ? (
        <select
          className="select"
          style={{ fontSize: 11, padding: "3px 6px", height: 26, width: 90, flexShrink: 0 }}
          value={m.court}
          onChange={e => updateMatch(m.id, { court: Number(e.target.value) })}
          onClick={e => e.stopPropagation()}
        >
          {Array.from({ length: numCourts }, (_, i) => (
            <option key={i + 1} value={i + 1}>{getCourtName(i + 1, courtNames)}</option>
          ))}
        </select>
      ) : (
        <span className="badge" style={{ flexShrink: 0 }}>{getCourtName(m.court, courtNames)}</span>
      )}
      {isThird
        ? <span className="badge" style={{ color: "oklch(0.78 0.13 50)", borderColor: "oklch(0.78 0.13 50 / 0.4)", background: "oklch(0.78 0.13 50 / 0.08)" }}>· 3rd Place</span>
        : <StageBadge stage={m.stage} status={m.status}/>
      }
    </div>
  );
}

export function Timeline() {
  const { matches: MATCHES } = React.useContext(MatchesContext);
  const slots = ["10:00", "10:40", "11:20", "12:00", "12:40", "14:30", "15:15", "17:00"];
  return (
    <div className="col gap-3" style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 36, top: 6, bottom: 6, width: 1, background: "var(--stroke)" }}/>
      {slots.map((t, i) => {
        const matches = MATCHES.filter(m => m.time === t);
        const isLive = matches.some(m => m.status === "live");
        return (
          <div key={t} className="row gap-3" style={{ position: "relative" }}>
            <span className="mono" style={{ width: 36, fontSize: 11, color: "var(--text-mid)" }}>{t}</span>
            <span style={{
              width: 10, height: 10, borderRadius: 999,
              background: isLive ? "var(--green)" : "oklch(0.55 0.05 250 / 0.4)",
              boxShadow: isLive ? "0 0 12px var(--green)" : "none",
              border: "1px solid var(--stroke)",
              zIndex: 1,
            }}/>
            <div style={{ flex: 1, fontSize: 12, color: "var(--text-mid)" }}>
              {matches.length} match{matches.length === 1 ? "" : "es"} · {matches[0]?.stage === "semi" ? "Semi Final" : matches[0]?.stage === "final" ? "Final" : "Group"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --------------- RESULTS ENTRY ---------------
export function ResultsScreen({ info }) {
  const { matches, updateMatch } = React.useContext(MatchesContext);
  const [tab, setTab] = React.useState("todo");
  const target = info?.setTo ?? 15;
  const allowTwoPoint = info?.allowTwoPoint ?? true;
  const [justSavedId, setJustSavedId] = React.useState(null);

  const semiMatches = matches.filter(m => m.stage === "semi");
  const semisDone   = semiMatches.length > 0 && semiMatches.every(m => m.status === "done");

  const live     = matches.filter(m => m.status === "live");
  const upcoming = matches.filter(m => m.status === "upcoming");
  const done     = matches.filter(m => m.status === "done");

  const handleUpdate = (id, patch) => {
    if (patch.status === "done") {
      setJustSavedId(id);
      setTimeout(() => setJustSavedId(null), 1500);
    }
    updateMatch(id, patch);
  };

  const justSavedMatch = justSavedId ? done.find(m => m.id === justSavedId) : null;
  const todoShown  = [...live, ...(justSavedMatch ? [justSavedMatch] : []), ...upcoming];
  const shown = tab === "live" ? live : tab === "done" ? done : todoShown;

  return (
    <div>
      <SectionTitle
        eyebrow="Match Results"
        title="Record Final Score"
        sub="Enter the final set scores and confirm the winner once a match concludes. No live point-by-point updates needed."
        right={
          <div className="seg">
            <button className={tab === "todo" ? "active" : ""} onClick={() => setTab("todo")}>To do · {live.length + upcoming.length}</button>
            <button className={tab === "live" ? "active" : ""} onClick={() => setTab("live")}>Live · {live.length}</button>
            <button className={tab === "done" ? "active" : ""} onClick={() => setTab("done")}>Done · {done.length}</button>
          </div>
        }
      />

      <div className="col gap-4">
        {shown.map(m => (
          <ResultCard key={m.id} m={m} onUpdate={handleUpdate} target={target} allowTwoPoint={allowTwoPoint} />
        ))}
        {shown.length === 0 && (
          <div className="glass-thin" style={{ padding: 24, textAlign: "center", borderStyle: "dashed" }}>
            <span style={{ fontSize: 13, color: "var(--text-low)" }}>No matches in this view.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultCard({ m, onUpdate, target = 15, allowTwoPoint = true }) {
  const { teams, courtNames, matches, groupStageLocked, tournamentComplete } = React.useContext(MatchesContext);
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  const isBO3 = m.stage === "semi" || m.stage === "final";
  const numSets = isBO3 ? 3 : 1;
  const locked = m.status === "upcoming";

  const [sets, setSets] = React.useState(() => {
    const seeded = m.sets.length ? m.sets : [];
    return Array.from({ length: numSets }, (_, i) => seeded[i] || ["", ""]);
  });
  const [winner, setWinner] = React.useState(m.winner);
  const [validationError, setValidationError] = React.useState(null);
  const saved = m.status === "done";

  // Auto-detect winner from scores (display hint only)
  const aSetWins = sets.filter(s => Number(s[0]) > Number(s[1]) && (s[0] !== "" && s[1] !== "")).length;
  const bSetWins = sets.filter(s => Number(s[1]) > Number(s[0]) && (s[0] !== "" && s[1] !== "")).length;
  const suggested = isBO3
    ? (aSetWins >= 2 ? m.a : bSetWins >= 2 ? m.b : null)
    : (sets[0] && sets[0][0] !== "" && sets[0][1] !== ""
        ? (Number(sets[0][0]) > Number(sets[0][1]) ? m.a : m.b)
        : null);

  const accent = m.stage === "final" ? "var(--gold)" : m.stage === "semi" ? "var(--purple)" : "var(--blue)";
  const majority = Math.ceil(numSets / 2); // 2 for BO3, 1 for single set
  // For BO3: enabled once a team wins the majority (2/3); unplayed sets are ignored
  // For single set: all scores must be filled
  const canSave = !locked && !saved && winner && (
    isBO3
      ? (aSetWins >= majority || bSetWins >= majority)
      : sets.every(s => s[0] !== "" && s[1] !== "")
  );

  const updateSet = (i, side, val) => {
    if (locked || saved) return;
    setValidationError(null);
    const next = [...sets];
    const pair = [...next[i]];
    pair[side] = val.replace(/[^0-9]/g, "").slice(0, 2);
    next[i] = pair;
    setSets(next);
  };

  const handleRecord = () => {
    // Only validate and save the sets that were actually played
    const playedSets = sets.filter(s => s[0] !== "" && s[1] !== "");
    const error = validateFinalScore(playedSets, target, allowTwoPoint);
    if (error) { setValidationError(error); return; }

    // Verify selected winner matches the played sets
    const aWins = playedSets.filter(s => Number(s[0]) > Number(s[1])).length;
    const bWins = playedSets.filter(s => Number(s[1]) > Number(s[0])).length;
    const expectedWinner = aWins > bWins ? m.a : m.b;
    if (winner !== expectedWinner) {
      setValidationError(
        `${findTeam(winner, teams).name} lost the match — ${findTeam(expectedWinner, teams).name} has the higher score.`
      );
      return;
    }

    setValidationError(null);
    // Save only the played sets (discard the unplayed blank set)
    onUpdate(m.id, { status: "done", sets: playedSets, winner });
  };

  const winnerTeam = saved ? findTeam(m.winner, teams) : null;

  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", borderTop: `2px solid ${accent}`, opacity: locked ? 0.78 : 1, position: "relative" }}>
      {locked && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(135deg, transparent 0 12px, oklch(0 0 0 / 0.04) 12px 13px)", zIndex: 1 }}/>
      )}

      {/* Header */}
      <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="row gap-3" style={{ flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 13, color: "var(--text-hi)", fontWeight: 600 }}>Match {m.id}</span>
          {m.status === "live" && <span className="badge live"><span className="dot pulse"/>Live</span>}
          {m.status === "done" && <span className="badge" style={{ color: "var(--green)" }}>{I.check} Recorded</span>}
          {m.status === "upcoming" && <span className="badge" style={{ color: "var(--text-mid)" }}><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg> Locked · not started</span>}
          {m.stage === "group" ? <GroupBadge g={m.group}/> : <span className={`badge ${m.stage}`}>{m.stage === "semi" ? "Semi Final" : "Final"}</span>}
          {isBO3 && <span className="badge">BEST OF 3</span>}
        </div>
        <div className="row gap-3">
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mid)" }}>{m.time}</span>
          <span className="badge">{getCourtName(m.court, courtNames)}</span>
        </div>
      </div>

      {/* Body — read-only result view when saved, editable form otherwise */}
      {saved ? (
        <div style={{ padding: "22px 24px" }}>
          <div className="row" style={{ alignItems: "center", gap: 12 }}>
            {/* Team A — always left */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <div className="row gap-3">
                <TeamAvatar team={findTeam(m.a, teams)} size={44}/>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: m.winner === m.a ? "var(--green)" : "var(--text-mid)" }}>{findTeam(m.a, teams).name}</div>
                  {m.winner === m.a && <span className="badge" style={{ color: "var(--green)", borderColor: "oklch(0.84 0.22 145 / 0.4)", background: "oklch(0.84 0.22 145 / 0.08)", fontSize: 10 }}>{I.trophy} Winner</span>}
                </div>
              </div>
            </div>

            {/* Score — center */}
            <div style={{ textAlign: "center", minWidth: 120 }}>
              <div className="label" style={{ marginBottom: 8 }}>Final score{isBO3 ? "s" : ""}</div>
              {m.sets.map((s, i) => (
                <div key={i} className="row" style={{ justifyContent: "center", gap: 10, marginBottom: 4 }}>
                  {isBO3 && <span className="mono" style={{ fontSize: 10, color: "var(--text-low)", width: 32 }}>Set {i + 1}</span>}
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: Number(s[0]) > Number(s[1]) ? "var(--green)" : "var(--text-mid)", minWidth: 28, textAlign: "right" }}>{s[0]}</span>
                  <span style={{ color: "var(--text-low)", fontSize: 18 }}>–</span>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: Number(s[1]) > Number(s[0]) ? "var(--green)" : "var(--text-mid)", minWidth: 28, textAlign: "left" }}>{s[1]}</span>
                </div>
              ))}
            </div>

            {/* Team B — always right */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div className="row gap-3">
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: m.winner === m.b ? "var(--green)" : "var(--text-mid)" }}>{findTeam(m.b, teams).name}</div>
                  {m.winner === m.b && <span className="badge" style={{ color: "var(--green)", borderColor: "oklch(0.84 0.22 145 / 0.4)", background: "oklch(0.84 0.22 145 / 0.08)", fontSize: 10 }}>{I.trophy} Winner</span>}
                </div>
                <TeamAvatar team={findTeam(m.b, teams)} size={44}/>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "22px 24px" }}>
          <div className="grid-12" style={{ gap: 18, alignItems: "stretch" }}>
            <TeamPicker side="left" team={a} active={winner === m.a} suggested={suggested === m.a} onPick={() => setWinner(m.a)} disabled={locked || m.a === "?"} />
            <div style={{ gridColumn: "span 4", textAlign: "center" }}>
              <div className="label" style={{ marginBottom: 12 }}>Final score{numSets > 1 ? "s" : ""}</div>
              <div className="col gap-3">
                {sets.map((s, i) => (
                  <SetRow key={i} idx={i + 1} a={s[0]} b={s[1]} showLabel={numSets > 1}
                    onChangeA={v => updateSet(i, 0, v)}
                    onChangeB={v => updateSet(i, 1, v)}
                    highlightA={s[0] !== "" && s[1] !== "" && Number(s[0]) > Number(s[1])}
                    highlightB={s[0] !== "" && s[1] !== "" && Number(s[1]) > Number(s[0])}
                    disabled={locked}
                  />
                ))}
              </div>
              {isBO3 && (
                <div className="row gap-2" style={{ marginTop: 10, justifyContent: "center" }}>
                  <span className="mono" style={{ fontSize: 11, color: aSetWins === 2 ? "var(--green)" : "var(--text-low)" }}>Sets {aSetWins}</span>
                  <span style={{ color: "var(--text-low)" }}>–</span>
                  <span className="mono" style={{ fontSize: 11, color: bSetWins === 2 ? "var(--green)" : "var(--text-low)" }}>{bSetWins} Sets</span>
                </div>
              )}
            </div>
            <TeamPicker side="right" team={b} active={winner === m.b} suggested={suggested === m.b} onPick={() => setWinner(m.b)} disabled={locked || m.b === "?"} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="row" style={{ justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--stroke)", background: "oklch(0 0 0 / 0.25)", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 2 }}>
        <div className="mono" style={{ fontSize: 11.5 }}>
          {validationError
            ? <span style={{ color: "var(--red)" }}>⚠ {validationError}</span>
            : saved
              ? <span style={{ color: "var(--green)" }}>{I.check} {winnerTeam?.name} confirmed as winner · points table updated</span>
              : locked
                ? <span style={{ color: "var(--text-low)" }}>Match hasn't started — results can be entered once it goes live.</span>
                : !canSave
                  ? <span style={{ color: "var(--text-low)" }}>Fill in every set score and pick the winning team to save.</span>
                  : <span style={{ color: "var(--text-low)" }}>Recording {findTeam(winner, teams).name} as the winner.</span>
          }
          {!locked && !saved && !validationError && suggested && winner !== suggested && (
            <span style={{ color: "var(--gold)", marginLeft: 10 }}>· Scores suggest {findTeam(suggested, teams).name}</span>
          )}
        </div>
        <div className="row gap-3">
          {locked && (() => {
            const isFinal = m.stage === "final";
            const semisDone = isFinal && matches.filter(x => x.stage === "semi").length > 0 && matches.filter(x => x.stage === "semi").every(x => x.status === "done");
            if (isFinal && !semisDone) {
              return <div style={{ fontSize: 12, color: "var(--text-low)" }}>Waiting for semi-finals to complete</div>;
            }
            if (m.a === "?" || m.b === "?") {
              return <div style={{ fontSize: 12, color: "var(--text-low)" }}>Teams not yet determined</div>;
            }
            const courtBlocked = matches.find(x => x.id !== m.id && x.court === m.court && x.status === "live");
            return courtBlocked ? (
              <div style={{ fontSize: 12, color: "var(--gold)" }}>
                ⚠ {getCourtName(m.court, courtNames)} is busy — complete <span className="mono">{courtBlocked.id}</span> first
              </div>
            ) : (
              <button className="btn primary sm" onClick={() => onUpdate(m.id, { status: "live" })}>
                {I.bolt} Start Match
              </button>
            );
          })()}
          {!locked && !tournamentComplete && !(saved && m.stage === "group" && groupStageLocked) && (
            <button className="btn sm ghost" onClick={() => { setSets(Array.from({ length: numSets }, () => ["", ""])); setWinner(null); setValidationError(null); onUpdate(m.id, { status: "upcoming", sets: [], winner: null }); }}>{I.refresh} {saved ? "Edit result" : "Reset"}</button>
          )}
          {saved && (m.stage === "group" && groupStageLocked || tournamentComplete) && (
            <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>
              {tournamentComplete ? "Tournament complete — locked" : "Group stage locked"}
            </span>
          )}
          {!saved && !locked && (
            <button className={`btn ${canSave ? "primary" : ""} sm`} disabled={!canSave} onClick={handleRecord}>
              {I.check} Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamPicker({ side, team, active, suggested, onPick, disabled }) {
  const ringColor = active ? "var(--green)" : suggested ? "var(--gold)" : "var(--stroke)";
  return (
    <div style={{ gridColumn: "span 4" }}>
      <button
        onClick={onPick}
        disabled={disabled}
        style={{
          width: "100%", height: "100%",
          padding: 18,
          background: active ? "oklch(0.84 0.22 145 / 0.10)" : "oklch(1 0 0 / 0.025)",
          border: `1px solid ${ringColor}`,
          borderRadius: 16,
          textAlign: side === "right" ? "right" : "left",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
          boxShadow: active ? "0 0 24px -6px var(--green), 0 0 0 3px oklch(0.84 0.22 145 / 0.12) inset" : "none",
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={e => !disabled && !active && (e.currentTarget.style.background = "oklch(1 0 0 / 0.05)")}
        onMouseLeave={e => !disabled && !active && (e.currentTarget.style.background = "oklch(1 0 0 / 0.025)")}
      >
        <div className="row gap-3" style={{ flexDirection: side === "right" ? "row-reverse" : "row", marginBottom: 14 }}>
          <TeamAvatar team={team} size={52}/>
          <div style={{ textAlign: side === "right" ? "right" : "left", minWidth: 0 }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>{team.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 4 }}>{team.p1} · {team.p2}</div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: side === "right" ? "flex-end" : "flex-start", gap: 8 }}>
          {active ? (
            <span className="badge" style={{ color: "var(--green)", borderColor: "oklch(0.84 0.22 145 / 0.5)", background: "oklch(0.84 0.22 145 / 0.12)" }}>
              {I.check} Winner selected
            </span>
          ) : suggested ? (
            <span className="badge" style={{ color: "var(--gold)" }}>
              ★ Scores favour this team — tap to confirm
            </span>
          ) : (
            <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Tap to mark winner</span>
          )}
        </div>
      </button>
    </div>
  );
}

export function SetRow({ idx, a, b, onChangeA, onChangeB, highlightA, highlightB, showLabel, disabled }) {
  return (
    <div className="row" style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
      {showLabel && <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)", width: 38 }}>SET {idx}</span>}
      <input
        className="input mono"
        inputMode="numeric"
        value={a}
        disabled={disabled}
        onChange={e => onChangeA(e.target.value)}
        placeholder="—"
        style={{ width: 72, textAlign: "center", fontSize: 22, fontWeight: 600, padding: "8px 10px", color: highlightA ? "var(--green)" : "var(--text-hi)", borderColor: highlightA ? "oklch(0.84 0.22 145 / 0.5)" : "var(--stroke)", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text" }}
      />
      <span className="mono" style={{ fontSize: 18, color: "var(--text-low)" }}>—</span>
      <input
        className="input mono"
        inputMode="numeric"
        value={b}
        disabled={disabled}
        onChange={e => onChangeB(e.target.value)}
        placeholder="—"
        style={{ width: 72, textAlign: "center", fontSize: 22, fontWeight: 600, padding: "8px 10px", color: highlightB ? "var(--green)" : "var(--text-hi)", borderColor: highlightB ? "oklch(0.84 0.22 145 / 0.5)" : "var(--stroke)", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text" }}
      />
    </div>
  );
}

export function GroupScoring({ m, a, b, setA, setB }) {
  const { matches, teams, courtNames } = React.useContext(MatchesContext);
  const teamA = findTeam(m.a, teams), teamB = findTeam(m.b, teams);
  const statsA = getTeamStats(m.a, matches);
  const statsB = getTeamStats(m.b, matches);
  const target = 15;
  const tbA = a - b;
  const tbB = b - a;
  const aWinning = a > b;

  return (
    <div className="grid-12">
      <div style={{ gridColumn: "span 9" }}>
        <div className="glass live-glow" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <Spotlight left="20%" top="-100px" color="var(--blue)" size={400} opacity={0.35}/>
          <Spotlight left="60%" top="-60px" color="var(--green)" size={300} opacity={0.25}/>

          <div className="row" style={{ justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--stroke)" }}>
            <div className="row gap-3">
              <span className="badge live"><span className="dot pulse"/>LIVE</span>
              <span className="badge">Match {m.id}</span>
              <GroupBadge g={m.group}/>
              <span className="badge">{getCourtName(m.court, courtNames)}</span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>SET 1 · FIRST TO {target} · 2PT MARGIN</span>
          </div>

          <div className="grid-12" style={{ padding: 28, alignItems: "center", gap: 16, position: "relative" }}>
            <ScoreSide side="left" team={teamA} score={a} setScore={setA} target={target} leading={aWinning}/>
            <div style={{ gridColumn: "span 2", textAlign: "center" }}>
              <div className="display" style={{ fontSize: 18, color: "var(--text-low)", fontWeight: 500 }}>VS</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-low)", marginTop: 8 }}>SET TO {target}</div>
            </div>
            <ScoreSide side="right" team={teamB} score={b} setScore={setB} target={target} leading={!aWinning}/>
          </div>

          <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid var(--stroke)", background: "oklch(0 0 0 / 0.25)" }}>
            <div className="row gap-3">
              <button className="btn sm">{I.refresh} Undo</button>
              <button className="btn sm">{I.edit} Adjust</button>
            </div>
            <div className="row gap-3">
              <button className="btn" disabled={!(a >= target && a - b >= 2)} style={{ borderColor: a >= target && a - b >= 2 ? "var(--green)" : "var(--stroke)" }}>
                {I.check} {teamA.name} wins
              </button>
              <button className="btn" disabled={!(b >= target && b - a >= 2)} style={{ borderColor: b >= target && b - a >= 2 ? "var(--green)" : "var(--stroke)" }}>
                {I.check} {teamB.name} wins
              </button>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: 20, marginTop: 16 }}>
          <div className="label" style={{ marginBottom: 12 }}>Tie-breaker preview · live</div>
          <div className="grid-12" style={{ gap: 14 }}>
            <TbCard team={teamA} prev={statsA.tb} delta={tbA} col={6}/>
            <TbCard team={teamB} prev={statsB.tb} delta={tbB} col={6}/>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-low)", marginTop: 12 }}>
            TB = Σ (points_scored − points_against). Updates the moment the match is finalised.
          </div>
        </div>
      </div>

      <div style={{ gridColumn: "span 3" }}>
        <div className="glass" style={{ padding: 20, position: "sticky", top: 36 }}>
          <div className="label" style={{ marginBottom: 12 }}>Court Camera · {getCourtName(m.court, courtNames)}</div>
          <div className="court-3d" style={{ marginBottom: 14 }}>
            <div className="court-floor"/>
            <div className="court-lines"/>
            <div className="court-net"/>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(40% 30% at 50% 35%, oklch(0.85 0.16 88 / 0.18), transparent 60%)" }}/>
          </div>
          <div className="col gap-2">
            <Kv k="Elapsed" v="14:32"/>
            <Kv k="Rallies" v="38"/>
            <Kv k="Longest rally" v="22 shots"/>
            <Kv k="Last point" v={`${aWinning ? teamA.name : teamB.name}`}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScoreSide({ side, team, score, setScore, target, leading }) {
  const color = leading ? "var(--green)" : "var(--text-mid)";
  return (
    <div style={{ gridColumn: "span 5", textAlign: side === "right" ? "right" : "left" }}>
      <div className="row gap-3" style={{ flexDirection: side === "right" ? "row-reverse" : "row", alignItems: "center", marginBottom: 14 }}>
        <TeamAvatar team={team} size={56}/>
        <div style={{ textAlign: side === "right" ? "right" : "left" }}>
          <div className="display" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-hi)", letterSpacing: "-0.02em" }}>{team.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-low)" }}>{team.p1} · {team.p2}</div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: side === "right" ? "flex-end" : "flex-start", gap: 14, alignItems: "center" }}>
        {side === "left" && (
          <button onClick={() => setScore(Math.max(0, score - 1))} className="btn" style={{ width: 48, height: 48, borderRadius: 14, padding: 0, fontSize: 22, color: "var(--text-mid)" }}>−</button>
        )}
        <div className="score-big mono" style={{ color, lineHeight: 0.85, textShadow: leading ? `0 0 30px ${color}` : "none", minWidth: 110, textAlign: "center" }}>
          {String(score).padStart(2, "0")}
        </div>
        {side === "right" ? null : (
          <button onClick={() => setScore(score + 1)} className="btn primary" style={{ width: 48, height: 48, borderRadius: 14, padding: 0, fontSize: 22 }}>+</button>
        )}
        {side === "right" && (
          <>
            <button onClick={() => setScore(score + 1)} className="btn primary" style={{ width: 48, height: 48, borderRadius: 14, padding: 0, fontSize: 22 }}>+</button>
            <button onClick={() => setScore(Math.max(0, score - 1))} className="btn" style={{ width: 48, height: 48, borderRadius: 14, padding: 0, fontSize: 22, color: "var(--text-mid)" }}>−</button>
          </>
        )}
      </div>
      <div className="row" style={{ justifyContent: side === "right" ? "flex-end" : "flex-start", marginTop: 10 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>
          {Math.max(0, target - score)} to win
        </span>
      </div>
    </div>
  );
}

export function TbCard({ team, prev, delta, col }) {
  const positive = delta >= 0;
  return (
    <div className="glass-thin" style={{ gridColumn: `span ${col}`, padding: 14 }}>
      <div className="row gap-3" style={{ marginBottom: 8 }}>
        <TeamAvatar team={team} size={28}/>
        <div style={{ flex: 1, fontSize: 13, color: "var(--text-hi)", fontWeight: 500 }}>{team.name}</div>
      </div>
      <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-low)" }}>{prev > 0 ? `+${prev}` : prev}</span>
        <span style={{ color: "var(--text-low)", fontSize: 12 }}>→</span>
        <span className="mono" style={{ fontSize: 22, color: positive ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
          {(prev + delta) > 0 ? `+${prev + delta}` : prev + delta}
        </span>
        <span className="mono" style={{ fontSize: 11, color: positive ? "var(--green)" : "var(--red)", marginLeft: "auto" }}>
          {positive ? "+" : ""}{delta}
        </span>
      </div>
    </div>
  );
}

export function Kv({ k, v }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed oklch(1 0 0 / 0.06)" }}>
      <span className="label" style={{ margin: 0 }}>{k}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--text-hi)" }}>{v}</span>
    </div>
  );
}

export function KnockoutScoring({ sets, setSets }) {
  const teamA = findTeam("T01"), teamB = findTeam("T05");
  const winsA = sets.filter(s => s[0] > s[1]).length;
  const winsB = sets.filter(s => s[1] > s[0]).length;
  const matchOver = winsA === 2 || winsB === 2;
  const winner = winsA > winsB ? teamA : teamB;

  return (
    <div className="grid-12">
      <div style={{ gridColumn: "span 8" }}>
        <div className="glass" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <Spotlight left="30%" top="-100px" color="var(--purple)" size={400} opacity={0.35}/>
          <div className="row" style={{ justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--stroke)" }}>
            <div className="row gap-3">
              <span className="badge semi">SEMI FINAL · SF1</span>
              <span className="badge">Court 1 · 14:30</span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>BEST OF 3 · FIRST TO 15</span>
          </div>

          {/* Big scoreboard */}
          <div className="grid-12" style={{ padding: 28, alignItems: "center", gap: 16 }}>
            <div style={{ gridColumn: "span 4" }}>
              <div className="col gap-3" style={{ alignItems: "flex-start" }}>
                <TeamAvatar team={teamA} size={64}/>
                <div>
                  <div className="display" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>{teamA.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-low)", marginTop: 4 }}>{teamA.p1} · {teamA.p2}</div>
                </div>
                <SetDots wins={winsA} color="var(--green)"/>
              </div>
            </div>
            <div style={{ gridColumn: "span 4", textAlign: "center" }}>
              <div className="display" style={{ fontSize: 12, color: "var(--text-low)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>SETS</div>
              <div className="row" style={{ justifyContent: "center", alignItems: "center", gap: 18, marginTop: 6 }}>
                <span className="score-big mono" style={{ color: winsA > winsB ? "var(--green)" : "var(--text-hi)" }}>{winsA}</span>
                <span className="display" style={{ fontSize: 32, color: "var(--text-low)" }}>—</span>
                <span className="score-big mono" style={{ color: winsB > winsA ? "var(--green)" : "var(--text-hi)" }}>{winsB}</span>
              </div>
              {matchOver && (
                <div className="badge final" style={{ marginTop: 14 }}>★ {winner.name} advances</div>
              )}
            </div>
            <div style={{ gridColumn: "span 4" }}>
              <div className="col gap-3" style={{ alignItems: "flex-end" }}>
                <TeamAvatar team={teamB} size={64}/>
                <div style={{ textAlign: "right" }}>
                  <div className="display" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-hi)" }}>{teamB.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-low)", marginTop: 4 }}>{teamB.p1} · {teamB.p2}</div>
                </div>
                <SetDots wins={winsB} color="var(--green)"/>
              </div>
            </div>
          </div>

          {/* set-by-set */}
          <div style={{ padding: "0 20px 24px" }}>
            <div className="grid-12" style={{ gap: 12 }}>
              {sets.map((s, i) => (
                <SetCard key={i} idx={i + 1} s={s} setS={(ns) => setSets(sets.map((x, j) => j === i ? ns : x))} aActive={s[0] > s[1]}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ gridColumn: "span 4" }}>
        <div className="glass" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
          {matchOver && <ConfettiBurst/>}
          <div className="label" style={{ marginBottom: 12 }}>{matchOver ? "Winner" : "Match in progress"}</div>
          {matchOver ? (
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="row gap-3" style={{ marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "linear-gradient(135deg, var(--gold), oklch(0.65 0.14 70))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "oklch(0.18 0.04 60)",
                  boxShadow: "0 0 24px oklch(0.85 0.16 88 / 0.6)"
                }}>{I.trophy}</div>
                <div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>{winner.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--gold)" }}>Advances to FINAL</div>
                </div>
              </div>
              <div className="col gap-2">
                <Kv k="Sets" v={`${winsA}–${winsB}`}/>
                <Kv k="Total points" v={`${sets.reduce((a,s) => a+s[0],0)}–${sets.reduce((a,s) => a+s[1],0)}`}/>
                <Kv k="Duration" v="42 min"/>
              </div>
              <button className="btn primary lg live-glow" style={{ width: "100%", marginTop: 18 }}>Confirm & Advance {I.chevron}</button>
            </div>
          ) : (
            <div>
              <SetDots wins={winsA} color="var(--green)" big/>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-low)", marginTop: 14 }}>First to win 2 sets wins the match.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SetDots({ wins, color, big }) {
  const sz = big ? 18 : 10;
  return (
    <div className="row gap-2">
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: sz, height: sz, borderRadius: 999,
          background: i < wins ? color : "oklch(1 0 0 / 0.08)",
          boxShadow: i < wins ? `0 0 12px ${color}` : "none",
          border: i < wins ? "none" : "1px solid var(--stroke)",
        }}/>
      ))}
    </div>
  );
}

export function SetCard({ idx, s, setS, aActive }) {
  const isFinal = (s[0] >= 15 && s[0] - s[1] >= 2) || (s[1] >= 15 && s[1] - s[0] >= 2);
  return (
    <div className="glass-thin" style={{ gridColumn: "span 4", padding: 14, border: isFinal ? "1px solid oklch(0.84 0.22 145 / 0.4)" : "1px solid var(--stroke)" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span className="label" style={{ margin: 0 }}>SET {idx}</span>
        {isFinal && <span className="mono" style={{ fontSize: 10, color: "var(--green)" }}>FINAL</span>}
      </div>
      <div className="row" style={{ gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <input className="input mono" style={{ textAlign: "center", padding: 8, fontSize: 22, color: aActive ? "var(--green)" : "var(--text-hi)", fontWeight: 600 }}
          value={s[0]} onChange={e => setS([+e.target.value || 0, s[1]])}/>
        <span className="mono" style={{ color: "var(--text-low)" }}>—</span>
        <input className="input mono" style={{ textAlign: "center", padding: 8, fontSize: 22, color: !aActive ? "var(--green)" : "var(--text-hi)", fontWeight: 600 }}
          value={s[1]} onChange={e => setS([s[0], +e.target.value || 0])}/>
      </div>
    </div>
  );
}


// --------------- POINTS TABLE ---------------
export function PointsScreen({ info }) {
  const { matches: MATCHES, teams, groupStageLocked } = React.useContext(MatchesContext);
  const ALL_LABELS = ["A", "B", "C", "D"];
  const groups = ALL_LABELS.slice(0, info?.numGroups ?? 3);
  const knockoutsStarted = MATCHES.some(m => m.stage === "semi" && (m.status === "live" || m.status === "done"));
  const [tab, setTab] = React.useState(knockoutsStarted ? "knockout" : "group");

  const semiMatches  = MATCHES.filter(m => m.stage === "semi");
  const finalMatch   = MATCHES.find(m => m.stage === "final");

  return (
    <div>
      <SectionTitle
        eyebrow="Standings"
        title="Points Table"
        sub="Ranked by points, then tie-breaker. Top 2 in each group advance to the knockouts."
        right={
          <div className="seg">
            <button className={tab === "group" ? "active" : ""} onClick={() => setTab("group")}>Group Stage</button>
            <button className={tab === "knockout" ? "active" : ""} onClick={() => setTab("knockout")}>Knockouts</button>
          </div>
        }
      />

      {tab === "group" && (
        <div className="col gap-4">
          {groups.map(g => (
            <GroupStandingsTable key={g} g={g} pwin={info?.pwin ?? 3} plos={info?.plos ?? 0}/>
          ))}
          <div className="glass" style={{ padding: 20 }}>
            <div className="label" style={{ marginBottom: 10 }}>Tie-breaker formula</div>
            <code className="mono" style={{ display: "block", padding: 12, borderRadius: 10, background: "oklch(0 0 0 / 0.4)", color: "var(--green)", fontSize: 12.5, lineHeight: 1.6 }}>
              tb(team) = Σ <span style={{ color: "var(--blue)" }}>(points_for − points_against)</span>
            </code>
          </div>
        </div>
      )}

      {tab === "knockout" && (
        <div className="col gap-4">
          {!knockoutsStarted ? (
            <div className="glass-thin" style={{ padding: 32, textAlign: "center", borderStyle: "dashed" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: 14, color: "var(--text-mid)" }}>Knockout standings will appear here once the semi-finals begin.</div>
            </div>
          ) : (
            <>
              {semiMatches.map(m => (
                <KnockoutMatchTable key={m.id} m={m} teams={teams} label={`Semi Final · ${m.id}`} accent="var(--purple)" advanceLabel="Advances to Final" />
              ))}
              {(() => {
                const semisDone = semiMatches.length > 0 && semiMatches.every(m => m.status === "done");
                if (semisDone && finalMatch && finalMatch.a !== "?") {
                  return <KnockoutMatchTable m={finalMatch} teams={teams} label="Final" accent="var(--gold)" advanceLabel="🏆 Champion" />;
                }
                return (
                  <div className="glass-thin" style={{ padding: 20, textAlign: "center", borderStyle: "dashed" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>
                      {semisDone ? "Final matchup being determined…" : "Final will appear once both semi-finals are complete."}
                    </span>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function KnockoutMatchTable({ m, teams, label, accent, advanceLabel }) {
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  const isDone = m.status === "done";
  const isLive = m.status === "live";

  const aScore = m.sets.reduce((sum, s) => sum + (Number(s[0]) > Number(s[1]) ? 1 : 0), 0);
  const bScore = m.sets.reduce((sum, s) => sum + (Number(s[1]) > Number(s[0]) ? 1 : 0), 0);

  const rows = [
    { team: a, id: m.a, setWins: aScore, winner: m.winner === m.a },
    { team: b, id: m.b, setWins: bScore, winner: m.winner === m.b },
  ];

  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", borderTop: `2px solid ${accent}` }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-3">
          <span className="badge" style={{ borderColor: accent, color: accent }}>{label}</span>
          {isLive && <span className="badge live"><span className="dot pulse"/>Live</span>}
          {isDone && <span className="badge" style={{ color: "var(--green)" }}>{I.check} Completed</span>}
          {!isDone && !isLive && <span className="badge">Upcoming</span>}
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>{m.time} · Court {m.court}</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Team</th>
            <th style={{ width: 100 }}>Sets Won</th>
            {m.sets.map((_, i) => <th key={i} style={{ width: 80 }}>Set {i + 1}</th>)}
            <th style={{ width: 160 }}>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ team, id, setWins, winner }) => (
            <tr key={id} style={{
              background: winner ? "oklch(1 0 0 / 0.04)" : "transparent",
              borderLeft: winner ? `2px solid ${accent}` : "2px solid transparent",
            }}>
              <td>
                <div className="row gap-3">
                  <TeamAvatar team={team} size={32}/>
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--text-hi)", fontWeight: 500 }}>{team.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-low)" }}>{team.p1} · {team.p2}</div>
                  </div>
                </div>
              </td>
              <td><span className="mono" style={{ fontSize: 18, fontWeight: 700, color: winner ? accent : "var(--text-hi)" }}>{setWins}</span></td>
              {m.sets.map((s, i) => {
                const myScore = id === m.a ? Number(s[0]) : Number(s[1]);
                const opScore = id === m.a ? Number(s[1]) : Number(s[0]);
                return (
                  <td key={i}>
                    <span className="mono" style={{ color: myScore > opScore ? "var(--green)" : "var(--text-mid)", fontWeight: myScore > opScore ? 600 : 400 }}>
                      {myScore}
                    </span>
                  </td>
                );
              })}
              <td>
                {isDone
                  ? winner
                    ? <span className="badge" style={{ color: accent }}>{advanceLabel}</span>
                    : <span className="badge" style={{ color: "var(--red)" }}>Eliminated</span>
                  : <span style={{ fontSize: 12, color: "var(--text-low)" }}>—</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GroupStandingsTable({ g, pwin = 3, plos = 0 }) {
  const { matches, teams } = React.useContext(MatchesContext);
  const sorted = computeStandings(matches, teams, g, pwin, plos);

  // Compute status only when mathematically certain
  const groupMatches = matches.filter(m => m.stage === "group" && m.group === g);
  const allDone = groupMatches.length > 0 && groupMatches.every(m => m.status === "done");

  const getStatus = (team, rank) => {
    if (sorted.length < 2) return null;
    // After all group matches are done: final standings
    if (allDone) {
      if (rank < 2)  return { label: "★ Qualified", color: "var(--green)", bg: "oklch(0.84 0.22 145 / 0.08)", border: "oklch(0.84 0.22 145 / 0.4)" };
      return { label: "Eliminated", color: "var(--red)", bg: "oklch(0.55 0.20 25 / 0.08)", border: "oklch(0.55 0.20 25 / 0.3)" };
    }
    // During group stage: calculate max possible points for each team
    const remaining = (tid) => groupMatches.filter(m => (m.a === tid || m.b === tid) && m.status !== "done").length;
    const maxPts = (tid, pts) => pts + remaining(tid) * pwin;
    const second = sorted[1];
    // Eliminated: even winning all remaining can't beat current 2nd place's pts
    if (maxPts(team.id, team.pts) < second.pts) {
      return { label: "Eliminated", color: "var(--red)", bg: "oklch(0.55 0.20 25 / 0.08)", border: "oklch(0.55 0.20 25 / 0.3)" };
    }
    // Qualified: even if current 3rd wins all remaining, can't overtake this team
    if (sorted.length > 2) {
      const third = sorted[2];
      if (team.pts > maxPts(third.id, third.pts)) {
        return { label: "★ Qualified", color: "var(--green)", bg: "oklch(0.84 0.22 145 / 0.08)", border: "oklch(0.84 0.22 145 / 0.4)" };
      }
    }
    return null;
  };

  return (
    <div className={`glass group-tint-${g}`} style={{ padding: 0, overflow: "hidden" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-3">
          <GroupBadge g={g}/>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>Group {g} Standings</span>
        </div>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>TOP 2 ADVANCE</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 60 }}>Rank</th>
            <th>Team</th>
            <th style={{ width: 90 }}>Played</th>
            <th style={{ width: 90 }}>Wins</th>
            <th style={{ width: 90 }}>Losses</th>
            <th style={{ width: 90 }}>Points</th>
            <th style={{ width: 110 }}>Tie-breaker</th>
            <th style={{ width: 150 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const status = getStatus(t, i);
            const isQ = status?.label.includes("Qualified");
            return (
              <tr key={t.id} style={{
                background: isQ ? "oklch(0.84 0.22 145 / 0.06)" : "transparent",
                borderLeft: isQ ? "2px solid var(--green)" : "2px solid transparent",
              }}>
                <td>
                  <div className="row gap-2">
                    {i === 0 && <span style={{ color: "var(--gold)" }}>{I.trophy}</span>}
                    <span className="mono" style={{ fontSize: 18, color: isQ ? "var(--green)" : "var(--text-hi)", fontWeight: 600 }}>{i + 1}</span>
                  </div>
                </td>
                <td>
                  <div className="row gap-3">
                    <TeamAvatar team={t} size={32}/>
                    <div>
                      <div style={{ fontSize: 13.5, color: "var(--text-hi)", fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-low)" }}>{t.p1} · {t.p2}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono">{t.wins + t.losses}</span></td>
                <td><span className="mono" style={{ color: "var(--green)" }}>{t.wins}</span></td>
                <td><span className="mono" style={{ color: t.losses > 0 ? "var(--red)" : "var(--text-low)" }}>{t.losses}</span></td>
                <td><span className="mono" style={{ fontSize: 15, color: "var(--text-hi)", fontWeight: 600 }}>{t.pts}</span></td>
                <td><span className="mono" style={{ color: t.tb >= 0 ? "var(--text-hi)" : "var(--red)" }}>{t.tb >= 0 ? `+${t.tb}` : t.tb}</span></td>
                <td>
                  {status
                    ? <span className="badge" style={{ color: status.color, background: status.bg, borderColor: status.border }}>{status.label}</span>
                    : <span style={{ fontSize: 12, color: "var(--text-low)" }}>—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SemiFinalStandings({ standings }) {
  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", borderTop: "2px solid var(--purple)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-3">
          <span className="badge semi">Semi Final</span>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>Semi-Final Standings</span>
        </div>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>WINNERS → FINAL</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 60 }}>Rank</th>
            <th>Team</th>
            <th style={{ width: 100 }}>Match</th>
            <th style={{ width: 100 }}>Sets Won</th>
            <th style={{ width: 120 }}>Sets Diff</th>
            <th style={{ width: 150 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={`${s.match}-${s.team.id}`} style={{
              background: s.advanced ? "oklch(0.85 0.16 88 / 0.06)" : "transparent",
              borderLeft: s.advanced ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <td><span className="mono" style={{ fontSize: 18, color: s.advanced ? "var(--gold)" : "var(--text-hi)", fontWeight: 600 }}>{i + 1}</span></td>
              <td>
                <div className="row gap-3">
                  <TeamAvatar team={s.team} size={32}/>
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--text-hi)", fontWeight: 500 }}>{s.team.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-low)" }}>{s.team.p1} · {s.team.p2}</div>
                  </div>
                </div>
              </td>
              <td><span className="mono" style={{ color: "var(--text-mid)" }}>{s.match}</span></td>
              <td><span className="mono" style={{ fontSize: 15, color: "var(--text-hi)", fontWeight: 600 }}>{s.sets}</span></td>
              <td><span className="mono" style={{ color: s.sets - s.oppSets >= 0 ? "var(--green)" : "var(--red)" }}>{s.sets - s.oppSets >= 0 ? `+${s.sets - s.oppSets}` : s.sets - s.oppSets}</span></td>
              <td>
                {s.advanced
                  ? <span className="badge final">★ Advances to Final</span>
                  : <span className="badge" style={{ color: "var(--red)" }}>Eliminated</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Movement({ n, from, to, up, same }) {
  const arrow = same ? "→" : up ? "▲" : "▼";
  const color = same ? "var(--text-low)" : up ? "var(--green)" : "var(--red)";
  return (
    <div className="row" style={{ padding: "8px 0", borderBottom: "1px dashed oklch(1 0 0 / 0.06)" }}>
      <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-hi)" }}>{n}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--text-low)", marginRight: 10 }}>{from}</span>
      <span className="mono" style={{ color, fontSize: 14, marginRight: 8 }}>{arrow}</span>
      <span className="mono" style={{ fontSize: 14, color: "var(--text-hi)", fontWeight: 600 }}>{to}</span>
    </div>
  );
}

// --------------- BRACKET ---------------
export function BracketScreen() {
  return (
    <div>
      <SectionTitle
        eyebrow="Knockout Stage"
        title="Tournament Bracket"
        sub="Top 2 from each group plus best 3rd-place team play the semis. Winners meet in the gold-court final."
      />

      <div className="glass" style={{ padding: 36, position: "relative", overflow: "hidden", minHeight: 540 }}>
        <Spotlight left="48%" top="20%" color="var(--gold)" size={460} opacity={0.30}/>
        <Spotlight left="0%" top="60%" color="var(--blue)" size={320} opacity={0.25}/>
        <Spotlight left="80%" top="60%" color="var(--purple)" size={320} opacity={0.25}/>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 36, alignItems: "center", position: "relative", zIndex: 2 }}>
          {/* left semi */}
          <div className="col gap-6">
            <BracketMatch label="Semi Final · SF1" stage="semi" a={findTeam("T01")} b={findTeam("T06")} winner={null} side="left"/>
            <BracketMatch label="Semi Final · SF2" stage="semi" a={findTeam("T05")} b={findTeam("T09")} winner={null} side="left"/>
          </div>

          {/* center final + trophy */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              margin: "0 auto",
              width: 140, height: 140, borderRadius: "50%",
              background: "radial-gradient(circle at 50% 30%, oklch(0.95 0.13 88), oklch(0.65 0.16 65))",
              boxShadow: "0 0 60px oklch(0.85 0.16 88 / 0.5), inset 0 0 24px oklch(1 0 0 / 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "oklch(0.18 0.04 60)",
              animation: "float-y 4s ease-in-out infinite",
            }}>
              <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor"><path d="M8 4h8v4a4 4 0 0 1-8 0V4z M16 6h3v2a3 3 0 0 1-3 3 M8 6H5v2a3 3 0 0 0 3 3 M10 12h4 M12 12v4 M9 20h6 M9 20l1-4 M15 20l-1-4" stroke="currentColor" strokeWidth="0.8" fill="none"/></svg>
            </div>
            <div className="display" style={{ marginTop: 16, fontSize: 13, color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>The Gold Court</div>

            <div className="glass" style={{ marginTop: 18, padding: 18, position: "relative", border: "1px solid oklch(0.85 0.16 88 / 0.35)", boxShadow: "0 0 24px oklch(0.85 0.16 88 / 0.18) inset" }}>
              <span className="badge final" style={{ marginBottom: 10 }}>★ FINAL · BEST OF 3</span>
              <div className="row" style={{ justifyContent: "space-between", padding: "10px 0" }}>
                <div className="row gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "oklch(1 0 0 / 0.06)", border: "1px dashed var(--stroke)" }}/>
                  <span style={{ fontSize: 13, color: "var(--text-mid)" }}>Winner SF1</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>TBD</span>
              </div>
              <div style={{ height: 1, background: "var(--stroke)" }}/>
              <div className="row" style={{ justifyContent: "space-between", padding: "10px 0" }}>
                <div className="row gap-2">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "oklch(1 0 0 / 0.06)", border: "1px dashed var(--stroke)" }}/>
                  <span style={{ fontSize: 13, color: "var(--text-mid)" }}>Winner SF2</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>TBD</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-low)", marginTop: 10 }}>Sun 17:00 · Court 1</div>
            </div>
          </div>

          {/* right — 3rd place */}
          <div className="col gap-6">
            <BracketMatch label="Bronze · Match" stage="bronze" a={{ name: "Loser SF1", group: "—", p1: "—", p2: "—" }} b={{ name: "Loser SF2", group: "—", p1: "—", p2: "—" }} winner={null} side="right"/>

            <div className="glass-thin" style={{ padding: 16 }}>
              <div className="label" style={{ marginBottom: 10 }}>Path to the Final</div>
              <div className="col gap-2" style={{ fontSize: 12.5, color: "var(--text-mid)" }}>
                <PathRow s="Group" w="3 wins · 0 losses"/>
                <PathRow s="Semi Final" w="Best of 3 sets"/>
                <PathRow s="Final" w="Best of 3 · Gold Court"/>
              </div>
            </div>
          </div>
        </div>

        {/* connector lines */}
        <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
          <defs>
            <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="oklch(0.74 0.18 238 / 0.5)"/><stop offset="100%" stopColor="oklch(0.85 0.16 88 / 0.5)"/></linearGradient>
          </defs>
          {/* lines from SF cards to final (visual decor) */}
        </svg>
      </div>
    </div>
  );
}

export function BracketMatch({ label, stage, a, b, winner, side }) {
  const accent = stage === "semi" ? "var(--purple)" : stage === "bronze" ? "var(--text-mid)" : "var(--gold)";
  return (
    <div className="glass lift" style={{ padding: 16, borderLeft: side === "left" ? `2px solid ${accent}` : "none", borderRight: side === "right" ? `2px solid ${accent}` : "none" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 10.5, color: accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-low)" }}>BO3</span>
      </div>
      <BracketTeamLine team={a} winner={winner === a.id}/>
      <div style={{ height: 1, background: "var(--stroke)", margin: "4px 0" }}/>
      <BracketTeamLine team={b} winner={winner === b.id}/>
    </div>
  );
}

export function BracketTeamLine({ team, winner }) {
  return (
    <div className="row" style={{ padding: "6px 0", gap: 10 }}>
      {team.name === "TBD" || team.group === "—" ? (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "oklch(1 0 0 / 0.04)", border: "1px dashed var(--stroke)" }}/>
      ) : <TeamAvatar team={team} size={28}/>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: winner ? "var(--green)" : "var(--text-hi)", fontWeight: winner ? 600 : 500 }}>{team.name}</div>
        <div style={{ fontSize: 10.5, color: "var(--text-low)" }}>{team.p1} · {team.p2}</div>
      </div>
      <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>—</span>
    </div>
  );
}

export function PathRow({ s, w }) {
  return (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-hi)" }}>{s}</span>
      <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>{w}</span>
    </div>
  );
}

// --------------- PUBLIC ---------------
export function PublicScreen({ info }) {
  const { matches: MATCHES } = React.useContext(MatchesContext);
  const liveMatches = MATCHES.filter(m => m.status === "live");

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="label">Spectator Mode · {info?.tournamentDate || ""}</div>
          <h2 className="display" style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 600, color: "var(--text-hi)" }}>Live · {info?.tournamentName || "Turtlemint Badminton Tournament"}</h2>
        </div>
        <div className="row gap-3">
          <span className="badge live"><span className="dot pulse"/>{liveMatches.length} match{liveMatches.length === 1 ? "" : "es"} in progress</span>
          <button className="btn sm">{I.eye} Full-screen TV</button>
        </div>
      </div>

      {/* Live match cards — one per ongoing match, no scores */}
      <div className="grid-12" style={{ marginBottom: 18 }}>
        {liveMatches.length === 0 && (
          <div style={{ gridColumn: "span 12" }}>
            <div className="glass" style={{ padding: 28, textAlign: "center" }}>
              <div className="display" style={{ fontSize: 18, color: "var(--text-mid)", marginBottom: 6 }}>No matches currently in progress</div>
              <div style={{ fontSize: 13, color: "var(--text-low)" }}>Check the schedule below for what's next on court.</div>
            </div>
          </div>
        )}
        {liveMatches.map(m => (
          <div key={m.id} style={{ gridColumn: `span ${12 / Math.min(liveMatches.length, 2)}` }}>
            <LiveMatchHero m={m}/>
          </div>
        ))}
      </div>

      {/* Up next */}
      <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--stroke)", justifyContent: "space-between" }}>
          <span className="label" style={{ margin: 0 }}>Up Next on Court</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-low)" }}>Schedule · today</span>
        </div>
        <div>
          {MATCHES
            .filter(m => m.status === "upcoming")
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 8)
            .map((m, i, arr) => <UpcomingRow key={m.id} m={m} last={i === arr.length - 1}/>)}
        </div>
      </div>
    </div>
  );
}

export function LiveMatchHero({ m }) {
  const { teams, courtNames } = React.useContext(MatchesContext);
  const a = findTeam(m.a, teams), b = findTeam(m.b, teams);
  return (
    <div className="glass live-glow" style={{ padding: 0, overflow: "hidden", position: "relative", height: "100%" }}>
      <Spotlight left="10%" top="-60px" color="var(--blue)" size={360} opacity={0.30}/>
      <Spotlight left="60%" top="60%" color="var(--green)" size={300} opacity={0.22}/>

      <div className="row" style={{ justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--stroke)" }}>
        <div className="row gap-3">
          <span className="badge live"><span className="dot pulse"/>Now Playing</span>
          <span className="badge">{getCourtName(m.court, courtNames)}</span>
          <GroupBadge g={m.group}/>
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mid)" }}>Match {m.id} · {m.time}</span>
      </div>

      <div style={{ padding: "30px 28px", position: "relative" }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div className="row gap-3" style={{ marginBottom: 10 }}>
              <TeamAvatar team={a} size={64}/>
              <div>
                <div className="display" style={{ fontSize: 26, fontWeight: 600, color: "var(--text-hi)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{a.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginTop: 6 }}>{a.p1} · {a.p2}</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "0 18px" }}>
            <div className="display" style={{ fontSize: 36, color: "var(--text-low)", fontWeight: 500, letterSpacing: "0.08em" }}>VS</div>
          </div>

          <div style={{ flex: 1, textAlign: "right" }}>
            <div className="row gap-3" style={{ marginBottom: 10, flexDirection: "row-reverse" }}>
              <TeamAvatar team={b} size={64}/>
              <div style={{ textAlign: "right" }}>
                <div className="display" style={{ fontSize: 26, fontWeight: 600, color: "var(--text-hi)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{b.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginTop: 6 }}>{b.p1} · {b.p2}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "center", marginTop: 22 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--green)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            <span className="dot pulse"/> Match in progress
          </span>
        </div>
      </div>
    </div>
  );
}

