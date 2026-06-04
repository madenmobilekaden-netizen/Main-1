export function TaskList({ tasks, isOwner, onComplete, onDelete, onAdd }) {
  const incomplete = tasks.filter(t => !t.completed);
  const complete = tasks.filter(t => t.completed);
  const sorted = [...incomplete, ...complete];

  return (
    <div>
      {isOwner && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button
            onClick={onAdd}
            style={{ background: "#3d6fab", border: "none", color: "#e8eef8", borderRadius: 8, padding: "10px 20px", fontSize: 15, fontWeight: 800, fontFamily: "'Barlow Condensed'", letterSpacing: ".05em", whiteSpace: "nowrap" }}
          >
            ＋ NEW TASK
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", color: "#6b80a0", padding: "40px 0", fontFamily: "'Barlow Condensed'", fontSize: 16 }}>
          No tasks yet.{isOwner ? " Create your first task!" : ""}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map(task => (
            <div
              key={task.id}
              style={{
                background: "#0d1220",
                border: `1.5px solid ${task.completed ? "#1e2a40" : "#2a3a55"}`,
                borderRadius: 12,
                padding: 16,
                opacity: task.completed ? 0.6 : 1,
                transition: "opacity .2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {task.completed && (
                      <span style={{ color: "#3db882", fontSize: 16 }}>✓</span>
                    )}
                    <div style={{
                      fontFamily: "'Barlow Condensed'", fontSize: 17, fontWeight: 700,
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#6b80a0" : "#fff",
                    }}>
                      {task.title}
                    </div>
                  </div>

                  {task.description && (
                    <div style={{ fontSize: 13, color: "#6b80a0", marginBottom: 6, lineHeight: 1.4 }}>
                      {task.description}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {task.jobs?.name && (
                      <div style={{ fontSize: 11, color: "#3d6fab", fontFamily: "'Barlow Condensed'", letterSpacing: ".04em" }}>
                        JOB: {task.jobs.name}
                      </div>
                    )}
                    {isOwner && task.created_by && (
                      <div style={{ fontSize: 11, color: "#6b80a0", fontFamily: "'Barlow Condensed'" }}>
                        CREATED BY: {task.created_by}
                      </div>
                    )}
                    {task.completed && task.completed_at && (
                      <div style={{ fontSize: 11, color: "#3db882", fontFamily: "'Barlow Condensed'" }}>
                        DONE {new Date(task.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  {!task.completed && !isOwner && (
                    <button
                      onClick={() => onComplete(task.id)}
                      style={{
                        background: "#3db882", border: "none", color: "#fff",
                        borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 800,
                        fontFamily: "'Barlow Condensed'", letterSpacing: ".04em", cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ MARK DONE
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => onDelete(task.id)}
                      style={{
                        background: "transparent", border: "1.5px solid #e0555533", color: "#e05555",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "'Barlow Condensed'",
                        cursor: "pointer",
                      }}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
