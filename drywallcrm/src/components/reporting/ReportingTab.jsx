import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { jobRevenue, crewPay } from "../../lib/constants";
import { StatCard } from "../ui/StatCard";

function exportCSV(jobs, crews) {
  const rows = [
    ["Job Name","Client","Address","Sq Ft","Stage","Crew","Revenue","Crew Pay","Net Margin","Created"],
    ...jobs.map(j => {
      const crew = crews.find(c => c.id === j.crew_id);
      const rev = jobRevenue(j);
      const pay = crewPay(j, crew);
      return [
        j.name, j.client || "", j.address || "", j.sqft, j.stage, crew?.name || "",
        rev.toFixed(2), pay.toFixed(2), (rev - pay).toFixed(2),
        j.created_at ? format(parseISO(j.created_at), "yyyy-MM-dd") : "",
      ];
    }),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `drywall-jobs-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportingTab({ jobs, crews }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonth = useMemo(() => jobs.filter(j => {
    if (!j.created_at) return false;
    return isWithinInterval(parseISO(j.created_at), { start: monthStart, end: monthEnd });
  }), [jobs]);

  const completed = useMemo(() => jobs.filter(j => j.stage === "Complete"), [jobs]);
  const completedThisMonth = useMemo(() => thisMonth.filter(j => j.stage === "Complete"), [thisMonth]);

  function sumRevenue(list) { return list.reduce((a, j) => a + jobRevenue(j), 0); }
  function sumPay(list) { return list.reduce((a, j) => a + crewPay(j, crews.find(c => c.id === j.crew_id)), 0); }

  const monthRevenue = sumRevenue(thisMonth);
  const monthPay = sumPay(thisMonth);
  const monthMargin = monthRevenue - monthPay;

  const totalRevenue = sumRevenue(jobs);
  const totalPay = sumPay(jobs);
  const totalMargin = totalRevenue - totalPay;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 800, letterSpacing: ".04em" }}>
          {format(now, "MMMM yyyy").toUpperCase()} SUMMARY
        </div>
        <button onClick={() => exportCSV(jobs, crews)} style={{
          background: "#3d6fab", border: "none", color: "#fff",
          borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 800,
          fontFamily: "'Barlow Condensed'", letterSpacing: ".05em",
        }}>
          ⬇ EXPORT CSV
        </button>
      </div>

      {/* Monthly stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Jobs This Month" value={thisMonth.length} sub={`${completedThisMonth.length} completed`} accent="#3d6fab" />
        <StatCard label="Month Revenue" value={`$${(monthRevenue/1000).toFixed(1)}k`} sub={monthRevenue > 0 ? `${Math.round((monthMargin/monthRevenue)*100)}% margin` : ""} accent="#3db882" />
        <StatCard label="Month Crew Pay" value={`$${(monthPay/1000).toFixed(1)}k`} accent="#3d6fab" />
        <StatCard label="Month Net Margin" value={`$${(monthMargin/1000).toFixed(1)}k`} accent="#3d6fab" />
      </div>

      {/* All-time stats */}
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700, color: "#6b80a0", letterSpacing: ".06em", marginBottom: 12 }}>ALL TIME</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Total Jobs" value={jobs.length} sub={`${completed.length} completed`} accent="#3d6fab" />
        <StatCard label="Total Revenue" value={`$${(totalRevenue/1000).toFixed(1)}k`} accent="#3db882" />
        <StatCard label="Total Crew Pay" value={`$${(totalPay/1000).toFixed(1)}k`} accent="#3d6fab" />
        <StatCard label="Total Net Margin" value={`$${(totalMargin/1000).toFixed(1)}k`} sub={totalRevenue > 0 ? `${Math.round((totalMargin/totalRevenue)*100)}% margin` : ""} accent="#3d6fab" />
      </div>

      {/* Jobs table */}
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700, color: "#6b80a0", letterSpacing: ".06em", marginBottom: 12 }}>ALL JOBS</div>
      <div style={{ background: "#0d1220", border: "1.5px solid #1e2a40", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0a0e1a" }}>
                {["JOB","CLIENT","SQ FT","STAGE","CREW","REVENUE","CREW PAY","MARGIN"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#6b80a0", letterSpacing: ".06em", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, idx) => {
                const crew = crews.find(c => c.id === j.crew_id);
                const rev = jobRevenue(j);
                const pay = crewPay(j, crew);
                const margin = rev - pay;
                return (
                  <tr key={j.id} style={{ borderTop: "1px solid #1e2a40", background: idx % 2 === 0 ? "transparent" : "#0a0e1a80" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{j.name}</td>
                    <td style={{ padding: "10px 14px", color: "#6b80a0" }}>{j.client || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>{(j.sqft || 0).toLocaleString()}</td>
                    <td style={{ padding: "10px 14px" }}>{j.stage}</td>
                    <td style={{ padding: "10px 14px", color: "#6b80a0" }}>{crew?.name || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#3db882" }}>${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: "10px 14px", color: "#3d6fab" }}>${pay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: "10px 14px", color: margin >= 0 ? "#3db882" : "#e05050" }}>${margin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
