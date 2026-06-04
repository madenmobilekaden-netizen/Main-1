import { useState } from "react";
import { STAGES, STAGE_COLORS, SHEET_SQFT, jobRevenue, crewPay, sheetTotal } from "../../lib/constants";
import { ProgressBar } from "../ui/ProgressBar";
import { PhotoGallery } from "../photos/PhotoGallery";
import { ActivityLog } from "../activity/ActivityLog";

export function JobDetail({ job, crews, onEdit, onDelete, onStageChange, onClose, isOwner }) {
  const crew = crews.find(c => c.id === job.crew_id);
  const revenue = jobRevenue(job);
  const pay = crewPay(job, crew);
  const margin = revenue - pay;
  const sheetSqft = sheetTotal(job.sheets || []);

  const [confirmStage, setConfirmStage] = useState(null);

  function handleStageClick(s) {
    if (s === job.stage) return;
    setConfirmStage(s);
  }

  function confirmStageChange() {
    onStageChange(job.id, confirmStage);
    setConfirmStage(null);
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 100,
      display: "flex", alignItems: "stretch", justifyContent: "flex-end",
      animation: "fadeOverlay .2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{
        background: "#0d1220", borderLeft: "1.5px solid #2a3a55",
        width: "min(520px, 100vw)", height: "100dvh", overflowY: "auto", padding: "16px",
        boxSizing: "border-box", maxWidth: "100vw",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{job.name}</div>
            {job.client && <div style={{ color: "#6b80a0", fontSize: 13, marginTop: 4 }}>{job.client}{job.address ? ` · ${job.address}` : ""}</div>}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#6b80a0", fontSize: 24, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ marginTop: 16 }}>
          <ProgressBar stage={job.stage} />
        </div>

        {/* Stage selector */}
        <div style={{ marginTop: 16, marginBottom: 4, fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#6b80a0", letterSpacing: ".08em" }}>
          UPDATE STAGE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {STAGES.map(s => (
            <button key={s} onClick={() => handleStageClick(s)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 13, fontFamily: "'Barlow Condensed'", fontWeight: 700, letterSpacing: ".04em",
              background: job.stage === s ? STAGE_COLORS[s] + "33" : "transparent",
              border: `1.5px solid ${job.stage === s ? STAGE_COLORS[s] : "#1e2a40"}`,
              color: job.stage === s ? STAGE_COLORS[s] : "#6b80a0",
            }}>{s}</button>
          ))}
        </div>

        {/* Confirm stage dialog */}
        {confirmStage && (
          <div style={{ marginTop: 12, background: "#0a0e1a", border: "1.5px solid #3d6fab44", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 10 }}>
              Move job from <strong style={{ color: STAGE_COLORS[job.stage] }}>{job.stage}</strong> → <strong style={{ color: STAGE_COLORS[confirmStage] }}>{confirmStage}</strong>?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmStage(null)} style={{ flex: 1, background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 8, padding: "8px", fontSize: 14, fontFamily: "'Barlow Condensed'" }}>CANCEL</button>
              <button onClick={confirmStageChange} style={{ flex: 1, background: "#3d6fab", border: "none", color: "#e8eef8", borderRadius: 8, padding: "8px", fontSize: 14, fontWeight: 800, fontFamily: "'Barlow Condensed'" }}>CONFIRM</button>
            </div>
          </div>
        )}

        {/* Financials (owner only) */}
        {isOwner && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))", gap: 10, marginTop: 20 }}>
            <div style={{ background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
              <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>JOB REVENUE</div>
              <div style={{ fontSize: 26, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: "#3db882" }}>${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style={{ fontSize: 12, color: "#6b80a0" }}>${job.job_rate}/sqft × {(job.sqft || 0).toLocaleString()} sqft</div>
            </div>
            <div style={{ background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
              <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>CREW PAY</div>
              <div style={{ fontSize: 26, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: "#3d6fab" }}>${pay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style={{ fontSize: 12, color: "#6b80a0" }}>${crew?.rate_per_sqft}/sqft × {(job.sqft || 0).toLocaleString()} sqft</div>
            </div>
            <div style={{ background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40", gridColumn: "1/-1" }}>
              <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>NET MARGIN</div>
              <div style={{ fontSize: 26, fontFamily: "'Barlow Condensed'", fontWeight: 800, color: margin >= 0 ? "#3db882" : "#e05050" }}>
                ${margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 12, color: "#6b80a0" }}>{revenue > 0 ? Math.round((margin / revenue) * 100) : 0}% margin</div>
            </div>
          </div>
        )}

        {/* Sheet breakdown */}
        <div style={{ marginTop: 18, background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 10 }}>SHEET BREAKDOWN</div>
          {(job.sheets || []).length === 0 ? (
            <div style={{ fontSize: 12, color: "#6b80a0" }}>No sheets logged.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 70px 70px", gap: 4 }}>
              {["SIZE","QTY","SQFT EA","TOTAL"].map(h => (
                <div key={h} style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", textAlign: h === "SIZE" ? "left" : "right" }}>{h}</div>
              ))}
              {(job.sheets || []).map((s, i) => (
                <>
                  <div key={`n${i}`} style={{ fontSize: 13, paddingTop: 6 }}>{s.size}</div>
                  <div key={`q${i}`} style={{ fontSize: 13, paddingTop: 6, textAlign: "right" }}>{s.qty}</div>
                  <div key={`u${i}`} style={{ fontSize: 13, paddingTop: 6, textAlign: "right", color: "#6b80a0" }}>{SHEET_SQFT[s.size]}</div>
                  <div key={`t${i}`} style={{ fontSize: 13, paddingTop: 6, textAlign: "right", color: "#3d6fab" }}>{((SHEET_SQFT[s.size] || 0) * s.qty).toLocaleString()}</div>
                </>
              ))}
              <div style={{ borderTop: "1px solid #1e2a40", marginTop: 6, paddingTop: 6, fontSize: 12, color: "#6b80a0", fontFamily: "'Barlow Condensed'" }}>TOTAL</div>
              <div /><div />
              <div style={{ borderTop: "1px solid #1e2a40", marginTop: 6, paddingTop: 6, fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed'", color: "#3d6fab", textAlign: "right" }}>{sheetSqft.toLocaleString()}</div>
            </div>
          )}
          {Math.abs(sheetSqft - (job.sqft || 0)) > 10 && sheetSqft > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#3d6fab", padding: "6px 10px", background: "#3d6fab10", borderRadius: 6, border: "1px solid #3d6fab40" }}>
              ⚠ Sheet coverage ({sheetSqft.toLocaleString()} sqft) differs from job sqft ({(job.sqft || 0).toLocaleString()})
            </div>
          )}
        </div>

        {/* Crew */}
        {crew && (
          <div style={{ marginTop: 14, background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 8 }}>ASSIGNED CREW</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{crew.name}</div>
            <div style={{ fontSize: 12, color: "#6b80a0", marginTop: 2 }}>{crew.members} members{isOwner ? ` · $${crew.rate_per_sqft}/sqft` : ""}</div>
          </div>
        )}

        {/* Notes */}
        {job.notes && (
          <div style={{ marginTop: 14, background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 6 }}>NOTES</div>
            <div style={{ fontSize: 13, color: "#6b80a0", lineHeight: 1.5 }}>{job.notes}</div>
          </div>
        )}

        {/* Photos (Phase 3) */}
        <PhotoGallery jobId={job.id} isOwner={isOwner} />

        {/* Activity log (Phase 3) */}
        <ActivityLog jobId={job.id} />

        {/* Actions (owner only) */}
        {isOwner && (
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button onClick={() => onEdit(job)} style={{ flex: 1, background: "transparent", border: "1.5px solid #2a3a55", color: "#e8eef8", borderRadius: 8, padding: 10, fontSize: 15, fontWeight: 700, letterSpacing: ".04em", fontFamily: "'Barlow Condensed'" }}>EDIT</button>
            <button onClick={() => { onDelete(job.id); onClose(); }} style={{ background: "#e0505022", border: "1.5px solid #e0505055", color: "#e05050", borderRadius: 8, padding: "10px 20px", fontSize: 15, fontWeight: 700, letterSpacing: ".04em", fontFamily: "'Barlow Condensed'" }}>DELETE</button>
          </div>
        )}
      </div>
    </div>
  );
}
