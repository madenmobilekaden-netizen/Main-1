import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { STAGES, STAGE_COLORS, stageIndex, stagePct, sheetTotal } from "../lib/constants";
import { StageBadge } from "../components/ui/Badge";
import { PhotoGallery } from "../components/photos/PhotoGallery";

export default function CrewLeaderDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmStage, setConfirmStage] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchAll(); }, [profile]);

  async function fetchAll() {
    if (!profile?.crew_id) { setLoading(false); return; }
    setLoading(true);
    const [{ data: jobsData }, { data: tasksData }] = await Promise.all([
      supabase.from("jobs").select("*, sheets:job_sheets(*)").eq("crew_id", profile.crew_id).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*, jobs(name)").eq("crew_id", profile.crew_id).order("created_at", { ascending: false }),
    ]);
    setJobs(jobsData || []);
    setTasks(tasksData || []);
    setLoading(false);
  }

  async function completeTask(taskId) {
    const now = new Date().toISOString();
    const { error } = await supabase.from("tasks").update({ completed: true, completed_at: now, completed_by: profile.id }).eq("id", taskId);
    if (error) { console.error("Error completing task:", error); return; }
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, completed: true, completed_at: now, completed_by: profile.id } : t));
  }

  async function changeStage(jobId, newStage) {
    setUpdating(true);
    const job = jobs.find(j => j.id === jobId);
    const oldStage = job?.stage;
    await supabase.from("jobs").update({ stage: newStage }).eq("id", jobId);
    // Log activity
    await supabase.from("job_activity").insert({
      job_id: jobId,
      message: `Stage updated from ${oldStage} to ${newStage}`,
      actor_id: profile.id,
    });
    // Notify owner via edge function
    supabase.functions.invoke("notify-stage-change", {
      body: { job_id: jobId, job_name: job?.name, old_stage: oldStage, new_stage: newStage, crew_id: profile.crew_id },
    }).catch(() => {});
    setJobs(js => js.map(j => j.id === jobId ? { ...j, stage: newStage } : j));
    if (selected?.id === jobId) setSelected(s => ({ ...s, stage: newStage }));
    setUpdating(false);
    setConfirmStage(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#060810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!profile?.crew_id) {
    return (
      <div style={{ minHeight: "100vh", background: "#060810", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 40 }}>🧱</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, color: "#3d6fab", textAlign: "center" }}>NO CREW ASSIGNED</div>
        <div style={{ fontSize: 14, color: "#6b80a0", textAlign: "center", maxWidth: 300 }}>You haven't been assigned to a crew yet. Contact your manager.</div>
        <button onClick={signOut} style={{ background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontFamily: "'Barlow Condensed'" }}>SIGN OUT</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060810" }}>
      {/* Header */}
      <div style={{ background: "#0a0e1a", borderBottom: "1.5px solid #1e2a40", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800, color: "#3d6fab", letterSpacing: ".06em" }}>🧱 MY JOBS</div>
          {tasks.filter(t => !t.completed).length > 0 && (
            <div style={{ background: "#3d6fab", color: "#111", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 800, fontFamily: "'Barlow Condensed'", letterSpacing: ".05em" }}>
              {tasks.filter(t => !t.completed).length} TASK{tasks.filter(t => !t.completed).length !== 1 ? "S" : ""}
            </div>
          )}
        </div>
        <button onClick={signOut} style={{ background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontFamily: "'Barlow Condensed'" }}>SIGN OUT</button>
      </div>

      <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, color: "#6b80a0", letterSpacing: ".08em", marginBottom: 10 }}>MY TASKS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...tasks.filter(t => !t.completed), ...tasks.filter(t => t.completed)].map(task => (
                <div key={task.id} style={{
                  background: "#0d1220",
                  border: `1.5px solid ${task.completed ? "#1e2a40" : "#2a3a55"}`,
                  borderRadius: 12,
                  padding: 16,
                  opacity: task.completed ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {task.completed && <span style={{ color: "#3db882", fontSize: 16 }}>✓</span>}
                        <div style={{
                          fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 700,
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "#6b80a0" : "#fff",
                        }}>{task.title}</div>
                      </div>
                      {task.description && (
                        <div style={{ fontSize: 13, color: "#6b80a0", marginBottom: 6, lineHeight: 1.4 }}>{task.description}</div>
                      )}
                      {task.jobs?.name && (
                        <div style={{ fontSize: 11, color: "#3d6fab", fontFamily: "'Barlow Condensed'", letterSpacing: ".04em" }}>JOB: {task.jobs.name}</div>
                      )}
                      {task.completed && task.completed_at && (
                        <div style={{ fontSize: 11, color: "#3db882", fontFamily: "'Barlow Condensed'", marginTop: 4 }}>
                          DONE {new Date(task.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {!task.completed && (
                      <button
                        onClick={() => completeTask(task.id)}
                        style={{
                          background: "#3db882", border: "none", color: "#fff", borderRadius: 10,
                          padding: "14px 18px", fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed'",
                          letterSpacing: ".04em", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                      >
                        ✓ MARK DONE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b80a0", padding: "60px 0", fontFamily: "'Barlow Condensed'", fontSize: 18 }}>No jobs assigned to your crew.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobs.map(job => {
              const p = stagePct(job.stage);
              const color = STAGE_COLORS[job.stage] || "#6b80a0";
              return (
                <div key={job.id} onClick={() => setSelected(job)} style={{
                  background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 12,
                  padding: 18, cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 19, fontWeight: 700 }}>{job.name}</div>
                    <StageBadge stage={job.stage} />
                  </div>
                  {job.address && <div style={{ fontSize: 13, color: "#6b80a0", marginBottom: 10 }}>{job.address}</div>}
                  {/* Progress */}
                  <div style={{ height: 8, background: "#1e2a40", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 4, transition: "width .4s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#6b80a0", marginTop: 4 }}>{p}% complete · {(job.sqft || 0).toLocaleString()} sqft</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job detail sheet */}
      {selected && (
        <div onClick={() => { setSelected(null); setConfirmStage(null); }} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 100,
          display: "flex", alignItems: "flex-end", animation: "fadeOverlay .2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} className="animate-in" style={{
            background: "#0d1220", borderTop: "1.5px solid #2a3a55", borderRadius: "16px 16px 0 0",
            width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 20,
          }}>
            <div style={{ width: 40, height: 4, background: "#2a3a55", borderRadius: 2, margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{selected.name}</div>
            {selected.address && <div style={{ fontSize: 13, color: "#6b80a0", marginBottom: 12 }}>{selected.address}</div>}

            {/* Current stage */}
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "#0a0e1a", borderRadius: 10, border: "1px solid #1e2a40" }}>
              <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em", marginBottom: 4 }}>CURRENT STAGE</div>
              <StageBadge stage={selected.stage} />
            </div>

            {/* Stage buttons — large for job site */}
            <div style={{ fontSize: 12, color: "#6b80a0", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em", marginBottom: 8 }}>UPDATE STAGE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {STAGES.map(s => {
                const isCurrent = selected.stage === s;
                const color = STAGE_COLORS[s];
                return (
                  <button key={s} onClick={() => !isCurrent && setConfirmStage(s)} style={{
                    padding: "14px 10px", borderRadius: 10, fontSize: 15, fontFamily: "'Barlow Condensed'", fontWeight: 700, letterSpacing: ".04em",
                    background: isCurrent ? color + "33" : "transparent",
                    border: `2px solid ${isCurrent ? color : "#1e2a40"}`,
                    color: isCurrent ? color : "#6b80a0",
                    cursor: isCurrent ? "default" : "pointer",
                  }}>{s}</button>
                );
              })}
            </div>

            {/* Confirm dialog */}
            {confirmStage && (
              <div style={{ background: "#0a0e1a", border: "1.5px solid #3d6fab44", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 15, marginBottom: 12, lineHeight: 1.4 }}>
                  Move to <strong style={{ color: STAGE_COLORS[confirmStage] }}>{confirmStage}</strong>?
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmStage(null)} style={{ flex: 1, background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 10, padding: 14, fontSize: 15, fontFamily: "'Barlow Condensed'" }}>CANCEL</button>
                  <button onClick={() => changeStage(selected.id, confirmStage)} disabled={updating} style={{ flex: 1, background: "#3d6fab", border: "none", color: "#e8eef8", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed'", opacity: updating ? 0.7 : 1 }}>
                    {updating ? "SAVING…" : "CONFIRM"}
                  </button>
                </div>
              </div>
            )}

            {/* Sheet breakdown */}
            {(selected.sheets || []).length > 0 && (
              <div style={{ background: "#0a0e1a", borderRadius: 10, padding: 14, border: "1px solid #1e2a40", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 10 }}>MATERIALS NEEDED</div>
                {(selected.sheets || []).map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < selected.sheets.length - 1 ? "1px solid #1e2a40" : "none" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.size}</span>
                    <span style={{ fontSize: 14, color: "#3d6fab", fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{s.qty} sheets</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {selected.notes && (
              <div style={{ background: "#0a0e1a", borderRadius: 10, padding: 14, border: "1px solid #1e2a40", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 6 }}>NOTES</div>
                <div style={{ fontSize: 13, color: "#6b80a0", lineHeight: 1.5 }}>{selected.notes}</div>
              </div>
            )}

            {/* Photos */}
            <PhotoGallery jobId={selected.id} isOwner={false} />

            <button onClick={() => { setSelected(null); setConfirmStage(null); }} style={{
              width: "100%", marginTop: 16, background: "transparent", border: "1.5px solid #2a3a55",
              color: "#6b80a0", borderRadius: 10, padding: 14, fontSize: 15, fontFamily: "'Barlow Condensed'",
            }}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
