import { useState, useEffect } from "react";

export function TaskModal({ task, crews, jobs, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [jobId, setJobId] = useState(task?.job_id || "");
  const [crewId, setCrewId] = useState(task?.crew_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!crewId) { setError("Please select a crew."); return; }
    setError("");
    setSaving(true);
    await onSave({ title: title.trim(), description: description.trim(), job_id: jobId || null, crew_id: crewId });
    setSaving(false);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#1e2329", border: "1.5px solid #363f50", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480 }}
      >
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800, color: "#f5c518", marginBottom: 20, letterSpacing: ".06em" }}>
          {task ? "EDIT TASK" : "NEW TASK"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#7a8499", letterSpacing: ".06em", marginBottom: 6 }}>TITLE *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Hang drywall in master bedroom"
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#7a8499", letterSpacing: ".06em", marginBottom: 6 }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional details…"
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#7a8499", letterSpacing: ".06em", marginBottom: 6 }}>CREW *</label>
            <select value={crewId} onChange={e => setCrewId(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }}>
              <option value="">— Select Crew —</option>
              {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#7a8499", letterSpacing: ".06em", marginBottom: 6 }}>JOB (OPTIONAL)</label>
            <select value={jobId} onChange={e => setJobId(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }}>
              <option value="">— No Job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>

          {error && <div style={{ color: "#e05555", fontSize: 13, fontFamily: "'Barlow Condensed'" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid #363f50", color: "#7a8499", borderRadius: 10, padding: 14, fontSize: 15, fontFamily: "'Barlow Condensed'" }}>
              CANCEL
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: "#f5c518", border: "none", color: "#111", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed'", letterSpacing: ".05em", opacity: saving ? 0.7 : 1 }}>
              {saving ? "SAVING…" : (task ? "SAVE CHANGES" : "CREATE TASK")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
