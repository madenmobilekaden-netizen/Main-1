import { useState } from "react";
import { STAGES, SHEET_SIZES, SHEET_SQFT, sheetTotal } from "../../lib/constants";
import { Label } from "../ui/Label";

export function JobModal({ job, crews, onSave, onClose }) {
  const blank = {
    name: "", client: "", address: "", sqft: "", stage: "Quoted",
    crew_id: crews[0]?.id || "", job_rate: "", notes: "",
    sheets: [{ size: "4×8 (32 sqft)", qty: "" }],
  };
  const [form, setForm] = useState(job ? {
    ...job,
    sqft: String(job.sqft),
    job_rate: String(job.job_rate),
    sheets: (job.sheets || []).map(s => ({ ...s, qty: String(s.qty) })),
  } : blank);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addSheet = () => setForm(f => ({ ...f, sheets: [...f.sheets, { size: "4×8 (32 sqft)", qty: "" }] }));
  const removeSheet = i => setForm(f => ({ ...f, sheets: f.sheets.filter((_, idx) => idx !== i) }));
  const setSheet = (i, k, v) => setForm(f => ({
    ...f, sheets: f.sheets.map((s, idx) => idx === i ? { ...s, [k]: v } : s),
  }));

  async function handleSave() {
    if (!form.name.trim() || !form.sqft || !form.job_rate) return;
    setSaving(true);
    await onSave({
      ...form,
      sqft: parseFloat(form.sqft) || 0,
      job_rate: parseFloat(form.job_rate) || 0,
      crew_id: form.crew_id || null,
      sheets: form.sheets.map(s => ({ size: s.size, qty: parseInt(s.qty) || 0 })).filter(s => s.qty > 0),
    });
    setSaving(false);
  }

  const sheetSqft = sheetTotal(form.sheets.map(s => ({ ...s, qty: parseInt(s.qty) || 0 })));

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeOverlay .2s ease", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{
        background: "#0d1220", border: "1.5px solid #2a3a55", borderRadius: 14,
        padding: 28, width: "min(640px, 100%)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, color: "#3d6fab", marginBottom: 20, letterSpacing: ".02em" }}>
          {job ? "✏ EDIT JOB" : "＋ NEW JOB"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Label>Job Name *</Label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Riverside Office Build" />
          </div>
          <div>
            <Label>Client</Label>
            <input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Client / Company" />
          </div>
          <div>
            <Label>Address</Label>
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Job site address" />
          </div>
          <div>
            <Label>Total Sq Ft *</Label>
            <input type="number" value={form.sqft} onChange={e => set("sqft", e.target.value)} placeholder="e.g. 4800" />
          </div>
          <div>
            <Label>Your Rate / Sq Ft ($) *</Label>
            <input type="number" step="0.01" value={form.job_rate} onChange={e => set("job_rate", e.target.value)} placeholder="e.g. 1.85" />
          </div>
          <div>
            <Label>Assign Crew</Label>
            <select value={form.crew_id || ""} onChange={e => set("crew_id", e.target.value)}>
              <option value="">— No crew —</option>
              {crews.map(c => <option key={c.id} value={c.id}>{c.name} — ${c.rate_per_sqft}/sqft</option>)}
            </select>
          </div>
          <div>
            <Label>Stage</Label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Label>Notes</Label>
            <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any special instructions..." style={{ resize: "vertical" }} />
          </div>
        </div>

        <div style={{ background: "#0a0e1a", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid #1e2a40" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 700, letterSpacing: ".04em" }}>SHEET BREAKDOWN</div>
            <span style={{ fontSize: 12, color: "#6b80a0" }}>
              Coverage: <strong style={{ color: "#3db882" }}>{sheetSqft.toLocaleString()} sqft</strong>
            </span>
          </div>
          {form.sheets.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 36px", gap: 8, marginBottom: 8 }}>
              <select value={s.size} onChange={e => setSheet(i, "size", e.target.value)}>
                {SHEET_SIZES.map(sz => <option key={sz}>{sz}</option>)}
              </select>
              <input type="number" value={s.qty} onChange={e => setSheet(i, "qty", e.target.value)} placeholder="Qty" />
              <button onClick={() => removeSheet(i)} style={{
                background: "transparent", border: "1.5px solid #2a3a55", color: "#e05050",
                borderRadius: 6, fontSize: 16, fontWeight: 700,
              }}>×</button>
            </div>
          ))}
          <button onClick={addSheet} style={{
            background: "transparent", border: "1.5px dashed #2a3a55", color: "#6b80a0",
            borderRadius: 6, padding: "6px 14px", fontSize: 13, fontFamily: "'Barlow Condensed'", letterSpacing: ".04em", width: "100%",
          }}>+ ADD SHEET SIZE</button>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={onClose} style={{
            background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0",
            borderRadius: 8, padding: "9px 22px", fontSize: 15, letterSpacing: ".04em",
          }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving} style={{
            background: "#3d6fab", border: "none", color: "#e8eef8",
            borderRadius: 8, padding: "9px 28px", fontSize: 15, fontWeight: 800, letterSpacing: ".04em",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "SAVING…" : "SAVE JOB"}
          </button>
        </div>
      </div>
    </div>
  );
}
