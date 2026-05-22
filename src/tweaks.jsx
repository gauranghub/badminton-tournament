import React from "react";

/* ============== TWEAKS PANEL ==============
   A floating bottom-right panel for design-time settings.
   In this standalone build there's no postMessage protocol —
   it just owns React state.
   ========================================== */

const panelCss = `
.twk-fab{position:fixed;right:18px;bottom:18px;z-index:9998;border-radius:999px;padding:10px 14px;background:linear-gradient(135deg,oklch(0.78 0.21 238),oklch(0.62 0.20 245));color:white;border:1px solid oklch(0.80 0.21 238 / 0.6);font-family:var(--font-display);font-weight:600;font-size:12px;cursor:pointer;box-shadow:0 8px 28px -8px oklch(0.74 0.18 238 / 0.7)}
.twk-panel{position:fixed;right:18px;bottom:18px;z-index:9999;width:300px;max-height:80vh;overflow:auto;border-radius:18px;background:linear-gradient(180deg,oklch(0.22 0.03 250 / 0.92),oklch(0.16 0.025 250 / 0.92));backdrop-filter:blur(20px) saturate(140%);border:1px solid var(--stroke);box-shadow:0 30px 60px -20px oklch(0 0 0 / 0.7);font-family:var(--font-body);color:var(--text)}
.twk-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--stroke);position:sticky;top:0;background:oklch(0.20 0.025 250 / 0.85);backdrop-filter:blur(10px);z-index:1}
.twk-head h3{margin:0;font-family:var(--font-display);font-size:14px;font-weight:600;color:var(--text-hi)}
.twk-close{background:transparent;border:1px solid var(--stroke);color:var(--text-mid);border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer}
.twk-sect{padding:12px 16px;border-bottom:1px solid var(--stroke)}
.twk-sect:last-child{border-bottom:0}
.twk-sect h4{margin:0 0 10px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-low);font-weight:500}
.twk-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.twk-row:last-child{margin-bottom:0}
.twk-row label{font-size:12.5px;color:var(--text-hi);flex:1;min-width:0}
.twk-input{background:oklch(0 0 0 / 0.35);border:1px solid var(--stroke);border-radius:8px;color:var(--text-hi);padding:6px 8px;font-size:12px;font-family:var(--font-body);width:140px;outline:none}
.twk-input:focus{border-color:oklch(0.78 0.21 238 / 0.55)}
.twk-toggle{width:36px;height:20px;border-radius:999px;background:oklch(0 0 0 / 0.4);border:1px solid var(--stroke);position:relative;cursor:pointer;flex-shrink:0;transition:background 0.18s ease}
.twk-toggle.on{background:var(--blue)}
.twk-toggle span{position:absolute;top:1px;left:1px;width:16px;height:16px;border-radius:999px;background:white;transition:left 0.18s ease}
.twk-toggle.on span{left:17px}
.twk-radio{display:inline-flex;background:oklch(0 0 0 / 0.35);border:1px solid var(--stroke);border-radius:999px;padding:2px;gap:1px}
.twk-radio button{border:0;background:transparent;color:var(--text-mid);padding:4px 8px;border-radius:999px;font-size:11px;font-family:var(--font-display);font-weight:500;cursor:pointer}
.twk-radio button.active{background:oklch(1 0 0 / 0.08);color:var(--text-hi)}
.twk-slider{display:flex;align-items:center;gap:8px}
.twk-slider input{accent-color:oklch(0.78 0.21 238);width:90px}
.twk-slider span{font-family:var(--font-mono);font-size:11px;color:var(--text-hi);min-width:24px;text-align:right}
.twk-btn{background:oklch(1 0 0 / 0.04);border:1px solid var(--stroke);color:var(--text-hi);border-radius:8px;padding:6px 10px;font-size:11.5px;cursor:pointer;font-family:var(--font-body);transition:background 0.15s ease}
.twk-btn:hover{background:oklch(1 0 0 / 0.08)}
`;

const STORAGE_KEY = "tournament_config";

export function useTweaks(defaults) {
  const [t, setT] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  const setTweak = React.useCallback((keyOrObj, value) => {
    setT(prev => {
      const next = typeof keyOrObj === "string"
        ? { ...prev, [keyOrObj]: value }
        : { ...prev, ...keyOrObj };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [t, setTweak];
}

export function TweaksPanel({ title = "Tweaks", children }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (document.getElementById("twk-style")) return;
    const s = document.createElement("style");
    s.id = "twk-style";
    s.textContent = panelCss;
    document.head.appendChild(s);
  }, []);
  if (!open) {
    return <button className="twk-fab" onClick={() => setOpen(true)}>⚙ Tweaks</button>;
  }
  return (
    <div className="twk-panel" role="dialog" aria-label={title}>
      <div className="twk-head">
        <h3>{title}</h3>
        <button className="twk-close" onClick={() => setOpen(false)}>Close</button>
      </div>
      {children}
    </div>
  );
}

export function TweakSection({ title, children }) {
  return (
    <div className="twk-sect">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export function TweakText({ label, value, onChange }) {
  return (
    <div className="twk-row">
      <label>{label}</label>
      <input className="twk-input" value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row">
      <label>{label}</label>
      <div className={`twk-toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)}><span/></div>
    </div>
  );
}

export function TweakRadio({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <label>{label}</label>
      <div className="twk-radio">
        {options.map(opt => {
          const v = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <button key={v} className={value === v ? "active" : ""} onClick={() => onChange(v)}>
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TweakSlider({ label, value, min, max, step = 1, onChange }) {
  return (
    <div className="twk-row">
      <label>{label}</label>
      <div className="twk-slider">
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
        <span>{value}</span>
      </div>
    </div>
  );
}

export function TweakButton({ label, onClick }) {
  return <button className="twk-btn" onClick={onClick}>{label}</button>;
}
