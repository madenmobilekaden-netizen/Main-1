export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#1e2329", border: "1.5px solid #2a3040", borderRadius: 10,
      padding: "16px 20px", flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: accent || "#e8eaf0", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#7a8499", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
