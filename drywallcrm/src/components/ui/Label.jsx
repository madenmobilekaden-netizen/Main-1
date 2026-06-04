export function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'",
      letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 5,
    }}>
      {children}
    </div>
  );
}
