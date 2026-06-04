import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import CrewLeaderDashboard from "./pages/CrewLeaderDashboard";

function AppInner() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1114", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return <Login />;

  // Profile might still be loading after session is set
  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1114", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (profile.role === "owner") return <OwnerDashboard />;
  if (profile.role === "crew_leader") return <CrewLeaderDashboard />;

  // Unknown role
  return (
    <div style={{ minHeight: "100vh", background: "#0f1114", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "#e05050", fontFamily: "'Barlow Condensed'", fontSize: 20 }}>Account not configured. Contact your admin.</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
