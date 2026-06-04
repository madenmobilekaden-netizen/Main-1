import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { jobRevenue, crewPay } from "../lib/constants";
import { StatCard } from "../components/ui/StatCard";
import { JobCard } from "../components/jobs/JobCard";
import { JobDetail } from "../components/jobs/JobDetail";
import { JobModal } from "../components/jobs/JobModal";
import { CrewModal } from "../components/crews/CrewModal";
import { CrewsTab } from "../components/crews/CrewsTab";
import { ReportingTab } from "../components/reporting/ReportingTab";
import { TaskModal } from "../components/tasks/TaskModal";
import { TaskList } from "../components/tasks/TaskList";
import { STAGES } from "../lib/constants";

export default function OwnerDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [crews, setCrews] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tab, setTab] = useState("jobs");
  const [filterStage, setFilterStage] = useState("All");
  const [filterCrew, setFilterCrew] = useState("All");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskFilterCrew, setTaskFilterCrew] = useState("All");
  const [taskModal, setTaskModal] = useState(false);
  const [jobModal, setJobModal] = useState(null);
  const [crewModal, setCrewModal] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: jobsData }, { data: crewsData }, { data: profilesData }, { data: tasksData }] = await Promise.all([
      supabase.from("jobs").select("*, sheets:job_sheets(*)").order("created_at", { ascending: false }),
      supabase.from("crews").select("*").order("name"),
      supabase.from("profiles").select("*").eq("role", "crew_leader"),
      supabase.from("tasks").select("*, jobs(name)").order("created_at", { ascending: false }),
    ]);
    setJobs(jobsData || []);
    setCrews(crewsData || []);
    setProfiles(profilesData || []);
    setTasks(tasksData || []);
    setLoading(false);
  }

  const totalRevenue = useMemo(() => jobs.reduce((a, j) => a + jobRevenue(j), 0), [jobs]);
  const totalPay = useMemo(() => jobs.reduce((a, j) => a + crewPay(j, crews.find(c => c.id === j.crew_id)), 0), [jobs, crews]);
  const totalSqft = useMemo(() => jobs.reduce((a, j) => a + (j.sqft || 0), 0), [jobs]);
  const activeJobs = useMemo(() => jobs.filter(j => j.stage !== "Complete"), [jobs]);

  const filtered = useMemo(() => jobs.filter(j => {
    if (filterStage !== "All" && j.stage !== filterStage) return false;
    if (filterCrew !== "All" && j.crew_id !== filterCrew) return false;
    if (search && !j.name?.toLowerCase().includes(search.toLowerCase()) && !j.client?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [jobs, filterStage, filterCrew, search]);

  async function saveJob(jobData) {
    const { sheets, ...rest } = jobData;
    if (rest.id && jobs.some(j => j.id === rest.id)) {
      // Update existing
      await supabase.from("jobs").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", rest.id);
      await supabase.from("job_sheets").delete().eq("job_id", rest.id);
      if (sheets?.length) await supabase.from("job_sheets").insert(sheets.map(s => ({ ...s, job_id: rest.id })));
      // Log activity
      await supabase.from("job_activity").insert({ job_id: rest.id, message: "Job details updated", actor_id: profile.id });
    } else {
      // Insert new
      const { data } = await supabase.from("jobs").insert({ ...rest, owner_id: profile.id }).select().single();
      if (data && sheets?.length) await supabase.from("job_sheets").insert(sheets.map(s => ({ ...s, job_id: data.id })));
      if (data) await supabase.from("job_activity").insert({ job_id: data.id, message: "Job created", actor_id: profile.id });
    }
    await fetchAll();
    setJobModal(null);
    if (detailJob?.id === rest.id) {
      const updated = (await supabase.from("jobs").select("*, sheets:job_sheets(*)").eq("id", rest.id).single()).data;
      setDetailJob(updated);
    }
  }

  async function deleteJob(id) {
    await supabase.from("job_sheets").delete().eq("job_id", id);
    await supabase.from("job_photos").delete().eq("job_id", id);
    await supabase.from("job_activity").delete().eq("job_id", id);
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(js => js.filter(j => j.id !== id));
  }

  async function stageChange(id, stage) {
    const job = jobs.find(j => j.id === id);
    await supabase.from("jobs").update({ stage }).eq("id", id);
    await supabase.from("job_activity").insert({
      job_id: id,
      message: `Stage moved from ${job?.stage} to ${stage}`,
      actor_id: profile.id,
    });
    setJobs(js => js.map(j => j.id === id ? { ...j, stage } : j));
    if (detailJob?.id === id) setDetailJob(d => ({ ...d, stage }));
  }

  async function saveCrew(crewData) {
    if (crewData.id && crews.some(c => c.id === crewData.id)) {
      await supabase.from("crews").update(crewData).eq("id", crewData.id);
    } else {
      await supabase.from("crews").insert({ ...crewData, owner_id: profile.id });
    }
    const { data } = await supabase.from("crews").select("*").order("name");
    setCrews(data || []);
    setCrewModal(null);
  }

  async function deleteCrew(id) {
    await supabase.from("crews").delete().eq("id", id);
    setCrews(cs => cs.filter(c => c.id !== id));
  }

  async function saveTask(taskData) {
    const { data, error } = await supabase.from("tasks").insert({ ...taskData, created_by: profile.id }).select("*, jobs(name)").single();
    if (error) { console.error("Error creating task:", error); return; }
    setTasks(ts => [data, ...ts]);
    setTaskModal(false);
  }

  async function deleteTask(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { console.error("Error deleting task:", error); return; }
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#060810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  const TABS = ["jobs","crews","reporting","tasks"];

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#060810" }}>
        {/* Header — two-row on mobile */}
        <div style={{ background: "#0a0e1a", borderBottom: "1.5px solid #1e2a40" }}>
          {/* Top row: logo + sign out */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 800, color: "#3d6fab", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
              🧱 HARRIS GROUP CRM
            </div>
            <button onClick={signOut} style={{ background: "transparent", border: "1.5px solid #2a3a55", color: "#6b80a0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontFamily: "'Barlow Condensed'", flexShrink: 0 }}>SIGN OUT</button>
          </div>
          {/* Bottom row: tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: "0 8px" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? "#3d6fab18" : "transparent",
                border: "none", borderBottom: tab === t ? "2px solid #3d6fab" : "2px solid transparent",
                color: tab === t ? "#3d6fab" : "#6b80a0",
                fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 700, letterSpacing: ".07em",
                padding: "10px 16px", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: "16px", maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {/* Stats — 2-col grid on mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))", gap: 10, marginBottom: 20 }}>
            <StatCard label="Active Jobs" value={activeJobs.length} sub={`${jobs.length} total`} accent="#3d6fab" />
            <StatCard label="Total Revenue" value={`$${(totalRevenue/1000).toFixed(1)}k`} sub={`$${jobs.length > 0 ? (totalRevenue/totalSqft).toFixed(2) : "—"}/sqft avg`} accent="#3db882" />
            <StatCard label="Crew Pay Out" value={`$${(totalPay/1000).toFixed(1)}k`} sub={`$${jobs.length > 0 ? (totalPay/totalSqft).toFixed(2) : "—"}/sqft avg`} accent="#3d6fab" />
            <StatCard label="Net Margin" value={`$${((totalRevenue-totalPay)/1000).toFixed(1)}k`} sub={totalRevenue > 0 ? `${Math.round(((totalRevenue-totalPay)/totalRevenue)*100)}% margin` : ""} accent="#3d6fab" />
            <StatCard label="Total Sq Ft" value={totalSqft.toLocaleString()} sub="across all jobs" />
          </div>

          {tab === "jobs" && (
            <>
              {/* Filters — stacked on mobile */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs or clients…" />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ flex: "1 1 130px" }}>
                    <option value="All">All Stages</option>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select value={filterCrew} onChange={e => setFilterCrew(e.target.value)} style={{ flex: "1 1 130px" }}>
                    <option value="All">All Crews</option>
                    {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button onClick={() => setJobModal("new")} style={{
                  background: "#3d6fab", border: "none", color: "#e8eef8",
                  borderRadius: 8, padding: "12px 20px", fontSize: 16, fontWeight: 800,
                  fontFamily: "'Barlow Condensed'", letterSpacing: ".05em", width: "100%",
                }}>＋ NEW JOB</button>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", color: "#6b80a0", padding: "60px 0", fontFamily: "'Barlow Condensed'", fontSize: 18 }}>
                  No jobs found. {jobs.length === 0 ? "Create your first job!" : "Try adjusting filters."}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
                  {filtered.map(job => <JobCard key={job.id} job={job} crews={crews} onClick={() => setDetailJob(job)} isOwner />)}
                </div>
              )}
            </>
          )}

          {tab === "crews" && (
            <CrewsTab
              crews={crews} jobs={jobs}
              onAddCrew={() => setCrewModal("new")}
              onEditCrew={c => setCrewModal(c)}
              onDeleteCrew={deleteCrew}
              profiles={profiles}
              onRefreshProfiles={() => supabase.from("profiles").select("*").eq("role", "crew_leader").then(({ data }) => setProfiles(data || []))}
            />
          )}

          {tab === "reporting" && <ReportingTab jobs={jobs} crews={crews} />}

          {tab === "tasks" && (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                <select value={taskFilterCrew} onChange={e => setTaskFilterCrew(e.target.value)} style={{ width: "min(180px, 100%)" }}>
                  <option value="All">All Crews</option>
                  {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <TaskList
                tasks={taskFilterCrew === "All" ? tasks : tasks.filter(t => t.crew_id === taskFilterCrew)}
                isOwner
                onDelete={deleteTask}
                onAdd={() => setTaskModal(true)}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {jobModal && (
        <JobModal
          job={jobModal === "new" ? null : jobModal}
          crews={crews}
          onSave={saveJob}
          onClose={() => setJobModal(null)}
        />
      )}
      {crewModal && (
        <CrewModal
          crew={crewModal === "new" ? null : crewModal}
          onSave={saveCrew}
          onClose={() => setCrewModal(null)}
        />
      )}
      {taskModal && (
        <TaskModal
          task={null}
          crews={crews}
          jobs={jobs}
          onSave={saveTask}
          onClose={() => setTaskModal(false)}
        />
      )}
      {detailJob && (
        <JobDetail
          job={detailJob}
          crews={crews}
          onEdit={job => { setDetailJob(null); setTimeout(() => setJobModal(job), 50); }}
          onDelete={deleteJob}
          onStageChange={stageChange}
          onClose={() => setDetailJob(null)}
          isOwner
        />
      )}
    </>
  );
}
