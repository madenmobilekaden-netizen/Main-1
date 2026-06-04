export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 10,
      padding: "16px 20px", flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: accent || "#e8eef8", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b80a0", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
