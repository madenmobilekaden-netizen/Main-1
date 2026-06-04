import { STAGE_COLORS } from "../../lib/constants";

export function StageBadge({ stage }) {
  const color = STAGE_COLORS[stage] || "#6b80a0";
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
      letterSpacing: ".04em", textTransform: "uppercase",
      background: color + "22", color, border: `1px solid ${color}55`,
      whiteSpace: "nowrap",
    }}>
      {stage}
    </span>
  );
}
