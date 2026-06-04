import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#060810", padding: "0 16px",
    }}>
      <div className="animate-in" style={{
        background: "#0d1220", border: "1.5px solid #2a3a55", borderRadius: 16,
        padding: "36px 32px", width: "min(420px, 100%)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: "#3d6fab", letterSpacing: ".06em" }}>
            🧱 HARRIS GROUP CRM
          </div>
          <div style={{ fontSize: 13, color: "#6b80a0", marginTop: 6 }}>Sign in to your account</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 5 }}>Email</div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required autoComplete="email"
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 5 }}>Password</div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ background: "#e0505018", border: "1px solid #e0505044", color: "#e05050", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4, background: "#3d6fab", border: "none", color: "#e8eef8",
              borderRadius: 8, padding: "12px", fontSize: 16, fontWeight: 800,
              fontFamily: "'Barlow Condensed'", letterSpacing: ".06em",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: "14px", background: "#0a0e1a", borderRadius: 8, border: "1px solid #1e2a40" }}>
          <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em", marginBottom: 4 }}>CREW LEADERS</div>
          <div style={{ fontSize: 12, color: "#6b80a0", lineHeight: 1.5 }}>
            Use the email and password your owner invited you with. Contact your manager if you need access.
          </div>
        </div>
      </div>
    </div>
  );
}
