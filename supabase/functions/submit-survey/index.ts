import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { nom, prenom, email, telephone, statut, anneeEtude, profession } = await req.json();

    // Validate
    if (!nom || !prenom || !email || !telephone || !statut) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants." }), { status: 400, headers });
    }

    const GOOGLE_SHEETS_WEBHOOK_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
      console.error("GOOGLE_SHEETS_WEBHOOK_URL not configured");
      return new Response(JSON.stringify({ error: "Configuration serveur manquante." }), { status: 500, headers });
    }

    const now = new Date().toISOString();
    const statutLabel = statut === "etudiant" ? "Étudiant(e)" : "Personnel médical";
    const detail = statut === "etudiant" ? anneeEtude || "" : profession || "";

    // Send to Google Sheets via Apps Script Web App
    const sheetResponse = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom,
        prenom,
        email,
        telephone,
        statut: statutLabel,
        detail,
        date: now,
      }),
    });

    if (!sheetResponse.ok) {
      console.error("Google Sheets error:", await sheetResponse.text());
      return new Response(JSON.stringify({ error: "Erreur d'enregistrement." }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error("Submit survey error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500, headers });
  }
});
