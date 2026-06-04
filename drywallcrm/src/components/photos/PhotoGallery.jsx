import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export function PhotoGallery({ jobId, isOwner }) {
  const { session } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchPhotos(); }, [jobId]);

  async function fetchPhotos() {
    const { data } = await supabase
      .from("job_photos")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    setPhotos(data || []);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `jobs/${jobId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("job-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("job-photos").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("job_photos").insert({
        job_id: jobId,
        url: publicUrl,
        storage_path: path,
        uploaded_by: session.user.id,
      });
      if (dbErr) throw dbErr;
      await fetchPhotos();
    } catch (err) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
    fileRef.current.value = "";
  }

  async function handleDelete(photo) {
    await supabase.storage.from("job-photos").remove([photo.storage_path]);
    await supabase.from("job_photos").delete().eq("id", photo.id);
    setPhotos(p => p.filter(x => x.id !== photo.id));
  }

  return (
    <div style={{ marginTop: 18, background: "#0a0e1a", borderRadius: 8, padding: 14, border: "1px solid #1e2a40" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: ".06em" }}>PHOTOS</div>
        <label style={{
          background: "#3d6fab", color: "#111", borderRadius: 6, padding: "5px 14px",
          fontSize: 13, fontWeight: 800, fontFamily: "'Barlow Condensed'", letterSpacing: ".04em",
          cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1,
        }}>
          {uploading ? "UPLOADING…" : "＋ ADD PHOTO"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
      </div>
      {error && <div style={{ fontSize: 12, color: "#e05050", marginBottom: 8 }}>{error}</div>}
      {photos.length === 0 ? (
        <div style={{ fontSize: 12, color: "#6b80a0" }}>No photos yet. Tap "Add Photo" to upload from your camera or library.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
          {photos.map(p => (
            <div key={p.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 6, overflow: "hidden", cursor: "pointer" }}
              onClick={() => setLightbox(p)}>
              <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 16,
        }}>
          <img src={lightbox.url} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 10, objectFit: "contain" }} onClick={e => e.stopPropagation()} />
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={() => setLightbox(null)} style={{ background: "#2a3a55", border: "none", color: "#e8eef8", borderRadius: 8, padding: "8px 20px", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700 }}>CLOSE</button>
            {isOwner && (
              <button onClick={() => { handleDelete(lightbox); setLightbox(null); }} style={{ background: "#e0505022", border: "1.5px solid #e0505055", color: "#e05050", borderRadius: 8, padding: "8px 20px", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700 }}>DELETE</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
