import { STAGES, STAGE_COLORS, stageIndex, stagePct } from "../../lib/constants";

export function ProgressBar({ stage }) {
  const p = stagePct(stage);
  const color = STAGE_COLORS[stage] || "#7a8499";
  const idx = stageIndex(stage);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".04em" }}>
          STAGE {idx + 1} / {STAGES.length} — {stage.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{p}%</span>
      </div>
      <div style={{ height: 6, background: "#2a3040", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 3, transition: "width .4s ease" }} />
      </div>
      <div style={{ display: "flex", marginTop: 5, gap: 2 }}>
        {STAGES.map((s, i) => (
          <div key={s} title={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= idx ? STAGE_COLORS[s] : "#2a3040",
            opacity: i <= idx ? 1 : 0.4,
            transition: "background .3s",
          }} />
        ))}
      </div>
    </div>
  );
}
