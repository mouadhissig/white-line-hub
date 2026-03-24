import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://whitelineissig.me",
  "https://www.whitelineissig.me",
  "https://whitelineclub.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.app") ||
    origin.endsWith(".netlify.app");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const headers = getCorsHeaders(req);

  try {
    const { adminKey } = await req.json();

    const expectedKey = Deno.env.get("SURVEY_ADMIN_KEY");
    if (!expectedKey || adminKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: "Mot de passe incorrect." }),
        { status: 403, headers }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("survey_submissions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Reset error:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la réinitialisation." }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inscriptions réinitialisées." }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Reset survey error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur." }),
      { status: 500, headers }
    );
  }
});
