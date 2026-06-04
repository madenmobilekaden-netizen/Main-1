import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { job_id, job_name, old_stage, new_stage, crew_id } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get owner email
    const { data: ownerProfiles } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("role", "owner")
      .limit(1);

    const ownerEmail = ownerProfiles?.[0]?.email;
    if (!ownerEmail) throw new Error("No owner found");

    // Get crew name
    const { data: crew } = await supabaseAdmin.from("crews").select("name").eq("id", crew_id).single();

    const timestamp = new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    // Send email via Supabase's built-in SMTP / Resend integration
    // Using Supabase's auth.admin.sendRawEmail (or use RESEND_API_KEY env var)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Drywall CRM <noreply@yourdomain.com>",
          to: ownerEmail,
          subject: `Stage Update: ${job_name} → ${new_stage}`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #1e2329; color: #e8eaf0; padding: 24px; border-radius: 12px;">
              <h2 style="color: #f5c518; margin: 0 0 16px;">🧱 Job Stage Updated</h2>
              <p style="margin: 0 0 12px;"><strong>Job:</strong> ${job_name}</p>
              <p style="margin: 0 0 12px;"><strong>Crew:</strong> ${crew?.name || "Unknown"}</p>
              <p style="margin: 0 0 12px;">
                <strong>Stage:</strong>
                <span style="color: #7a8499;">${old_stage}</span>
                → <span style="color: #f5c518;">${new_stage}</span>
              </p>
              <p style="margin: 0; color: #7a8499; font-size: 13px;">${timestamp}</p>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
