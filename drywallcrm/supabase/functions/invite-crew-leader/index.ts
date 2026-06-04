import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, crew_id } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Invite user via Supabase Auth admin API
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: "crew_leader", crew_id: crew_id || null },
      redirectTo: `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/set-password`,
    });

    if (error) throw error;

    // Pre-create profile so we can set role and crew_id
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: data.user.id,
      email,
      role: "crew_leader",
      crew_id: crew_id || null,
      active: true,
    });

    if (profileError) throw profileError;

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
