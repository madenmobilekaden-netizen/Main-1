import { StageBadge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { jobRevenue, crewPay } from "../../lib/constants";

export function JobCard({ job, crews, onClick, isOwner }) {
  const crew = crews.find(c => c.id === job.crew_id);
  const revenue = jobRevenue(job);
  const pay = crewPay(job, crew);

  return (
    <div
      className="animate-in"
      onClick={onClick}
      style={{
        background: "#1e2329", border: "1.5px solid #2a3040", borderRadius: 12,
        padding: 18, cursor: "pointer", transition: "border-color .18s, transform .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#363f50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a3040"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 17, fontWeight: 700, lineHeight: 1.1, flex: 1, paddingRight: 8 }}>{job.name}</div>
        <StageBadge stage={job.stage} />
      </div>
      {job.client && <div style={{ fontSize: 12, color: "#7a8499", marginBottom: 2 }}>{job.client}</div>}
      {job.address && <div style={{ fontSize: 12, color: "#7a8499", marginBottom: 10 }}>{job.address}</div>}
      <ProgressBar stage={job.stage} />
      <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>SQ FT</div>
          <div style={{ fontSize: 16, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{(job.sqft || 0).toLocaleString()}</div>
        </div>
        {isOwner && (
          <>
            <div>
              <div style={{ fontSize: 10, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>REVENUE</div>
              <div style={{ fontSize: 16, fontFamily: "'Barlow Condensed'", fontWeight: 700, color: "#3db882" }}>${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>CREW PAY</div>
              <div style={{ fontSize: 16, fontFamily: "'Barlow Condensed'", fontWeight: 700, color: "#e07b39" }}>${pay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </>
        )}
        {crew && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#7a8499", fontFamily: "'Barlow Condensed'", letterSpacing: ".06em" }}>CREW</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{crew.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}
