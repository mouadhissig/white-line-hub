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
    const { nom, prenom, email, telephone, anneeEtude, formations } = await req.json();

    // Validate required fields
    if (!nom || !prenom || !email || !telephone || !anneeEtude || !formations || !Array.isArray(formations) || formations.length === 0) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants." }), { status: 400, headers });
    }

    // Server-side validation
    if (typeof nom !== 'string' || nom.trim().length === 0 || nom.length > 100) {
      return new Response(JSON.stringify({ error: "Nom invalide (max 100 caractères)." }), { status: 400, headers });
    }
    if (typeof prenom !== 'string' || prenom.trim().length === 0 || prenom.length > 100) {
      return new Response(JSON.stringify({ error: "Prénom invalide (max 100 caractères)." }), { status: 400, headers });
    }
    if (typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Adresse e-mail invalide." }), { status: 400, headers });
    }
    if (typeof telephone !== 'string' || telephone.trim().length === 0 || telephone.length > 20) {
      return new Response(JSON.stringify({ error: "Téléphone invalide (max 20 caractères)." }), { status: 400, headers });
    }
    if (typeof anneeEtude !== 'string' || anneeEtude.length > 50) {
      return new Response(JSON.stringify({ error: "Année d'étude invalide." }), { status: 400, headers });
    }
    const validFormations = ["sutures", "platrage"];
    if (!formations.every((f: string) => validFormations.includes(f))) {
      return new Response(JSON.stringify({ error: "Formation invalide." }), { status: 400, headers });
    }

    // Sanitize inputs
    const cleanNom = nom.trim().substring(0, 100);
    const cleanPrenom = prenom.trim().substring(0, 100);
    const cleanEmail = email.trim().substring(0, 255).toLowerCase();
    const cleanTelephone = telephone.trim().substring(0, 20);
    const cleanAnneeEtude = anneeEtude.trim().substring(0, 50);

    // Check for duplicate submission
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase
      .from("survey_submissions")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Vous avez déjà soumis votre inscription avec cet e-mail." }),
        { status: 409, headers }
      );
    }

    const formationLabels: Record<string, string> = {
      sutures: "Les sutures médicales",
      platrage: "Le plâtrage (pose de plâtre)",
    };
    const formationsText = formations.map((f: string) => formationLabels[f] || f).join(", ");

    const GOOGLE_SHEETS_WEBHOOK_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
      console.error("GOOGLE_SHEETS_WEBHOOK_URL not configured");
      return new Response(JSON.stringify({ error: "Configuration serveur manquante." }), { status: 500, headers });
    }

    const now = new Date().toISOString();

    // Send to Google Sheets via Apps Script Web App
    const sheetResponse = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: cleanNom,
        prenom: cleanPrenom,
        email: cleanEmail,
        telephone: cleanTelephone,
        anneeEtude: cleanAnneeEtude,
        formations: formationsText,
        date: now,
      }),
    });

    if (!sheetResponse.ok) {
      console.error("Google Sheets error:", await sheetResponse.text());
      return new Response(JSON.stringify({ error: "Erreur d'enregistrement." }), { status: 500, headers });
    }

    // Record submission to prevent duplicates
    const { error: insertError } = await supabase
      .from("survey_submissions")
      .insert({ email: cleanEmail });

    if (insertError) {
      console.error("Insert submission error:", insertError);
      // Don't fail the request since Google Sheets already has the data
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error("Submit survey error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500, headers });
  }
});
