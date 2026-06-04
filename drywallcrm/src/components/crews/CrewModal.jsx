import { useState } from "react";
import { Label } from "../ui/Label";

export function CrewModal({ crew, onSave, onClose }) {
  const [form, setForm] = useState(crew || { name: "", members: "", rate_per_sqft: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim() || !form.rate_per_sqft) return;
    setSaving(true);
    await onSave({
      ...form,
      members: parseInt(form.members) || 0,
      rate_per_sqft: parseFloat(form.rate_per_sqft) || 0,
    });
    setSaving(false);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeOverlay .2s ease", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{ background: "#0d1220", border: "1.5px solid #2a3a55", borderRadius: 14, padding: 28, width: "min(400px, 100%)" }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, color: "#3d6fab", marginBottom: 20 }}>
          {crew ? "✏ EDIT CREW" : "＋ NEW CREW"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><Label>Crew Name *</Label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Team Alpha" /></div>
          <div><Label>Members</Label><input type="number" value={form.members} onChange={e => set("members", e.target.value)} placeholder="# of workers" /></div>
          <div><Label>Rate per Sq Ft ($) *</Label><input type="number" step="0.01" value={form.rate_per_sqft} onChange={e => set("rate_per_sqft", e.target.value)} placeholder="e.g. 0.45" /></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 8, padding: "9px 22px", fontSize: 15, letterSpacing: ".04em" }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{ background: "#3d6fab", border: "none", color: "#fff", borderRadius: 8, padding: "9px 28px", fontSize: 15, fontWeight: 800, letterSpacing: ".04em", opacity: saving ? 0.7 : 1 }}>
            {saving ? "SAVING…" : "SAVE CREW"}
          </button>
        </div>
      </div>
    </div>
  );
}
