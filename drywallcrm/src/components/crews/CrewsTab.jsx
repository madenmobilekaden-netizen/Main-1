import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { crewPay } from "../../lib/constants";
import { StageBadge } from "../ui/Badge";
import { CrewModal } from "./CrewModal";

export function CrewsTab({ crews, jobs, onAddCrew, onEditCrew, onDeleteCrew, profiles, onRefreshProfiles }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCrewId, setInviteCrewId] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const { error } = await supabase.functions.invoke("invite-crew-leader", {
        body: { email: inviteEmail.trim(), crew_id: inviteCrewId || null },
      });
      if (error) throw error;
      setInviteMsg({ type: "success", text: `Invite sent to ${inviteEmail.trim()}` });
      setInviteEmail("");
      setInviteCrewId("");
      onRefreshProfiles?.();
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message || "Failed to send invite" });
    }
    setInviting(false);
  }

  async function handleDeactivate(profileId) {
    await supabase.from("profiles").update({ active: false }).eq("id", profileId);
    onRefreshProfiles?.();
  }

  async function handleActivate(profileId) {
    await supabase.from("profiles").update({ active: true }).eq("id", profileId);
    onRefreshProfiles?.();
  }

  async function handleAssignCrew(profileId, crewId) {
    await supabase.from("profiles").update({ crew_id: crewId || null }).eq("id", profileId);
    onRefreshProfiles?.();
  }

  const crewLeaders = (profiles || []).filter(p => p.role === "crew_leader");

  return (
    <div>
      {/* Invite crew leader */}
      <div style={{ background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: "#3d6fab", letterSpacing: ".04em", marginBottom: 14 }}>
          INVITE CREW LEADER
        </div>
        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            placeholder="crew@example.com" required
          />
          <select value={inviteCrewId} onChange={e => setInviteCrewId(e.target.value)}>
            <option value="">— Assign crew (optional) —</option>
            {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" disabled={inviting} style={{
            background: "#3d6fab", border: "none", color: "#e8eef8",
            borderRadius: 8, padding: "12px 20px", fontSize: 15, fontWeight: 800,
            fontFamily: "'Barlow Condensed'", letterSpacing: ".05em",
            opacity: inviting ? 0.7 : 1, width: "100%",
          }}>
            {inviting ? "SENDING…" : "SEND INVITE"}
          </button>
        </form>
        {inviteMsg && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13,
            background: inviteMsg.type === "success" ? "#3db88218" : "#e0505018",
            color: inviteMsg.type === "success" ? "#3db882" : "#e05050",
            border: `1px solid ${inviteMsg.type === "success" ? "#3db88244" : "#e0505044"}`,
          }}>
            {inviteMsg.text}
          </div>
        )}
      </div>

      {/* Crew leader accounts */}
      {crewLeaders.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700, letterSpacing: ".06em", color: "#6b80a0", marginBottom: 12 }}>CREW LEADER ACCOUNTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {crewLeaders.map(p => {
              const assignedCrew = crews.find(c => c.id === p.crew_id);
              return (
                <div key={p.id} style={{ background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.email}</div>
                    <div style={{ fontSize: 12, color: "#6b80a0", marginTop: 2 }}>{assignedCrew ? assignedCrew.name : "No crew assigned"}</div>
                  </div>
                  <select
                    value={p.crew_id || ""}
                    onChange={e => handleAssignCrew(p.id, e.target.value)}
                    style={{ width: 160, fontSize: 13, padding: "6px 10px" }}
                  >
                    <option value="">— No crew —</option>
                    {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span style={{
                    fontSize: 12, fontFamily: "'Barlow Condensed'", fontWeight: 700, letterSpacing: ".04em",
                    padding: "2px 10px", borderRadius: 99,
                    background: p.active !== false ? "#3db88222" : "#e0505022",
                    color: p.active !== false ? "#3db882" : "#e05050",
                    border: `1px solid ${p.active !== false ? "#3db88244" : "#e0505044"}`,
                  }}>
                    {p.active !== false ? "ACTIVE" : "INACTIVE"}
                  </span>
                  <button
                    onClick={() => p.active !== false ? handleDeactivate(p.id) : handleActivate(p.id)}
                    style={{
                      background: "transparent",
                      border: `1.5px solid ${p.active !== false ? "#e0505044" : "#3db88244"}`,
                      color: p.active !== false ? "#e05050" : "#3db882",
                      borderRadius: 6, padding: "4px 12px", fontSize: 13, fontFamily: "'Barlow Condensed'",
                    }}
                  >
                    {p.active !== false ? "DEACTIVATE" : "ACTIVATE"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Crew cards */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={onAddCrew} style={{ background: "#3d6fab", border: "none", color: "#fff", borderRadius: 8, padding: "12px 22px", fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed'", letterSpacing: ".05em", width: "100%" }}>＋ NEW CREW</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
        {crews.map(crew => {
          const crewJobs = jobs.filter(j => j.crew_id === crew.id);
          const totalPay = crewJobs.reduce((a, j) => a + crewPay(j, crew), 0);
          const totalSqft = crewJobs.reduce((a, j) => a + (j.sqft || 0), 0);
          const activeJobs = crewJobs.filter(j => j.stage !== "Complete");
          return (
            <div key={crew.id} className="animate-in" style={{ background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800 }}>{crew.name}</div>
                  <div style={{ fontSize: 13, color: "#6b80a0", marginTop: 2 }}>{crew.members} members · <span style={{ color: "#3d6fab" }}>${crew.rate_per_sqft}/sqft</span></div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onEditCrew(crew)} style={{ background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 6, padding: "4px 10px", fontSize: 13, fontFamily: "'Barlow Condensed'" }}>EDIT</button>
                  <button onClick={() => onDeleteCrew(crew.id)} style={{ background: "transparent", border: "1.5px solid #e0505044", color: "#e05050", borderRadius: 6, padding: "4px 10px", fontSize: 13, fontFamily: "'Barlow Condensed'" }}>✕</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {[
                  { label: "ACTIVE JOBS", value: activeJobs.length, color: "#3d6fab" },
                  { label: "TOTAL SQFT", value: totalSqft.toLocaleString(), color: null },
                  { label: "TOTAL PAY", value: `$${totalPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#3d6fab" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "#0a0e1a", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>{label}</div>
                    <div style={{ fontSize: 22, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: color || "#e8eef8" }}>{value}</div>
                  </div>
                ))}
              </div>
              {crewJobs.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em", marginBottom: 6 }}>ASSIGNED JOBS</div>
                  {crewJobs.map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #1e2a40" }}>
                      <span>{j.name}</span>
                      <StageBadge stage={j.stage} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
