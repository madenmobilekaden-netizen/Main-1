import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

export function ActivityLog({ jobId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from("job_activity")
        .select("*, profiles(email)")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(30);
      setLogs(data || []);
      setLoading(false);
    }
    fetch();
  }, [jobId]);

  if (loading) return null;
  if (logs.length === 0) return null;

  return (
    <div style={{ marginTop: 18, background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginBottom: 12 }}>ACTIVITY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logs.map(log => (
          <div key={log.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3d6fab", marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>{log.message}</div>
              <div style={{ fontSize: 11, color: "#6b80a0", marginTop: 2 }}>
                {log.profiles?.email} · {format(new Date(log.created_at), "MMM d 'at' h:mmaaa")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
