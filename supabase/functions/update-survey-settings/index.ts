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
    const body = await req.json();
    const { adminKey, atelierCap, atelierCaps } = body;

    const expectedKey = Deno.env.get("SURVEY_ADMIN_KEY");
    if (!expectedKey || adminKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: "Mot de passe incorrect." }),
        { status: 403, headers }
      );
    }

    const VALID_ATELIERS = ["atelier1", "atelier2", "atelier3", "atelier4"];
    const rows: { key: string; value: number; updated_at: string }[] = [];
    const now = new Date().toISOString();

    // Global cap (legacy)
    if (atelierCap !== undefined) {
      const cap = Number(atelierCap);
      if (!Number.isInteger(cap) || cap < 1 || cap > 1000) {
        return new Response(JSON.stringify({ error: "Capacité globale invalide (1-1000)." }), { status: 400, headers });
      }
      rows.push({ key: "atelier_cap", value: cap, updated_at: now });
    }

    // Per-atelier caps: { atelier1: 25, atelier2: 30, ... }
    if (atelierCaps && typeof atelierCaps === "object") {
      for (const [k, v] of Object.entries(atelierCaps)) {
        if (!VALID_ATELIERS.includes(k)) {
          return new Response(JSON.stringify({ error: `Atelier invalide: ${k}` }), { status: 400, headers });
        }
        const cap = Number(v);
        if (!Number.isInteger(cap) || cap < 1 || cap > 1000) {
          return new Response(JSON.stringify({ error: `Capacité invalide pour ${k} (1-1000).` }), { status: 400, headers });
        }
        rows.push({ key: `atelier_cap_${k}`, value: cap, updated_at: now });
      }
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Aucune capacité fournie." }), { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("survey_settings").upsert(rows);

    if (error) {
      console.error("Update settings error:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour." }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, updated: rows.length }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Update survey settings error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur." }),
      { status: 500, headers }
    );
  }
});
