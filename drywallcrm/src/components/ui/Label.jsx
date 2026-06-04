export function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, color: "#7a8499", fontFamily: "'Barlow Condensed'",
      letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 5,
    }}>
      {children}
    </div>
  );
}
