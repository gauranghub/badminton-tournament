import React from "react";

// ============ SHARED COMPONENTS ============

export const I = {
  // minimal stroked icons
  dashboard: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/></svg>,
  teams: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2.4"/><path d="M3 19c.7-3 3-4.5 6-4.5S14.3 16 15 19"/><path d="M14 18c.5-2 2-3 3.5-3s2.6 1 3 2.6"/></svg>,
  groups: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>,
  schedule: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  live: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M5 5c-4 4-4 10 0 14M19 5c4 4 4 10 0 14M8 8c-2 2-2 6 0 8M16 8c2 2 2 6 0 8"/></svg>,
  table: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 16h18M9 4v16M15 4v16"/></svg>,
  bracket: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h4l3 4M3 19h4l3-4M14 5h4l3 4M14 19h4l3-4M10 9v6"/></svg>,
  settings: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  public: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  login: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 17l5-5-5-5M15 12H3M9 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-9"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  chevron: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>,
  search: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>,
  trophy: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M16 6h3v2a3 3 0 0 1-3 3M8 6H5v2a3 3 0 0 0 3 3"/><path d="M10 12h4M12 12v4M9 20h6M9 20l1-4M15 20l-1-4"/></svg>,
  shuttle: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="18" r="3"/><path d="M9 15l8-8M11 14l8-8M14 17l5-5M8 11l5-5"/></svg>,
  bolt: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
  check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4 4L19 6"/></svg>,
  close: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  drag: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>,
  eye: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 4l6 6L9 21H3v-6L14 4z"/></svg>,
  trash: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>,
  refresh: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>,
  star: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l3 7 7 .5-5.4 4.7L18 21l-6-3.6L6 21l1.4-6.8L2 9.5 9 9z"/></svg>,
};

// Team avatar — geometric monogram, color-tinted by group
export function TeamAvatar({ team, size = 40 }) {
  const palette = {
    A: ["oklch(0.74 0.18 238)", "oklch(0.55 0.20 248)"],
    B: ["oklch(0.84 0.22 145)", "oklch(0.65 0.20 155)"],
    C: ["oklch(0.68 0.20 295)", "oklch(0.55 0.20 285)"],
    D: ["oklch(0.85 0.16 88)", "oklch(0.70 0.15 72)"],
    "—": ["oklch(0.55 0.05 250)", "oklch(0.35 0.04 250)"],
  };
  const [c1, c2] = palette[team.group] || palette["—"];
  const initials = team.name.split(" ").map(s => s[0]).slice(0, 2).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "oklch(0.12 0.02 250)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: size * 0.34,
      letterSpacing: "-0.02em",
      boxShadow: "0 6px 14px -6px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.06) inset",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

export function GroupBadge({ g }) {
  const colors = {
    A: ["var(--blue)", "Group A"],
    B: ["var(--green)", "Group B"],
    C: ["var(--purple)", "Group C"],
    D: ["var(--gold)", "Group D"],
    "—": ["var(--text-low)", "—"],
  };
  const [c, label] = colors[g] || colors["—"];
  return <span className="badge" style={{ color: c, borderColor: `${c.replace(')', ' / 0.35)')}`, background: `${c.replace(')', ' / 0.08)')}` }}>● {label}</span>;
}

export function StageBadge({ stage, status }) {
  if (status === "live") return <span className="badge live"><span className="dot pulse"/>LIVE</span>;
  if (status === "done") return <span className="badge done"><span className="dot"/>Completed</span>;
  if (stage === "final") return <span className="badge final">★ Final</span>;
  if (stage === "semi") return <span className="badge semi">Semi Final</span>;
  return <span className="badge upcoming">Upcoming</span>;
}

export function ShuttleField() {
  // 4 drifting shuttles
  const shuttles = [
    { delay: 0,   top: "18%", dur: 14, scale: 0.7 },
    { delay: 4,   top: "62%", dur: 18, scale: 0.5 },
    { delay: 8,   top: "38%", dur: 16, scale: 0.9 },
    { delay: 12,  top: "78%", dur: 22, scale: 0.55 },
  ];
  return (
    <div className="shuttle-trail">
      {shuttles.map((s, i) => (
        <svg key={i} viewBox="0 0 40 40" width={50 * s.scale} height={50 * s.scale}
          style={{ top: s.top, animation: `drift ${s.dur}s linear ${s.delay}s infinite` }}>
          <defs>
            <radialGradient id={`sg${i}`} cx="50%" cy="60%" r="60%">
              <stop offset="0%" stopColor="oklch(0.95 0.005 250)"/>
              <stop offset="100%" stopColor="oklch(0.78 0.21 238)"/>
            </radialGradient>
          </defs>
          <circle cx="14" cy="26" r="5" fill={`url(#sg${i})`} opacity="0.95"/>
          <path d="M16 22 L34 6 M14 21 L28 4 M19 24 L36 12 M12 24 L24 4" stroke="oklch(0.95 0.01 250 / 0.85)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        </svg>
      ))}
    </div>
  );
}

export function Spotlight({ left, top, color = "var(--blue)", size = 360, opacity = 0.45 }) {
  return <div className="spotlight" style={{ left, top, width: size, height: size, background: color, opacity }} />;
}

export function StatCard({ label, value, sub, accent = "blue", icon }) {
  const accentColors = {
    blue: "var(--blue)",
    green: "var(--green)",
    gold: "var(--gold)",
    purple: "var(--purple)",
    red: "var(--red)",
  };
  const c = accentColors[accent] || accentColors.blue;
  return (
    <div className="glass lift" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: c, opacity: 0.10, filter: "blur(40px)" }}/>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span className="label" style={{ margin: 0 }}>{label}</span>
        {icon && <span style={{ color: c, opacity: 0.8 }}>{icon}</span>}
      </div>
      <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
        <span className="stat-num">{value}</span>
        {sub && <span className="mono" style={{ fontSize: 11, color: c }}>{sub}</span>}
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, sub, right }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
      <div>
        {eyebrow && <div className="label" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h2 className="display" style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--text-hi)" }}>{title}</h2>
        {sub && <p style={{ margin: "6px 0 0", color: "var(--text-mid)", fontSize: 13.5, maxWidth: 540 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}



export function ConfettiBurst() {
  const colors = ["var(--gold)", "var(--green)", "var(--blue)", "var(--purple)"];
  const pieces = Array.from({ length: 18 }).map((_, i) => ({
    left: `${(i * 19) % 100}%`, top: `${(i * 17) % 80}%`,
    color: colors[i % colors.length], delay: i * 0.3, rotate: i * 23,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <span key={i} className="confetti" style={{ left: p.left, top: p.top, background: p.color, transform: `rotate(${p.rotate}deg)`, animationDelay: `${p.delay}s`, animationDuration: `${4 + (i % 4)}s` }}/>
      ))}
    </div>
  );
}
