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

const VALID_STATUTS = ["etudiant", "personnel", "exterieur", "comite"];
const VALID_NIVEAUX = ["1ere", "2eme", "3eme"];
const VALID_CONFERENCES = ["confA", "confB", "confC", "confD", "tableRonde"];
const VALID_ATELIERS = ["atelier1", "atelier2", "atelier3", "atelier4"];

const STATUT_LABELS: Record<string, string> = {
  etudiant: "Étudiant",
  personnel: "Personnel de la faculté",
  exterieur: "Extérieur",
  comite: "Membre du comité d'organisation",
};
const NIVEAU_LABELS: Record<string, string> = {
  "1ere": "1ère année",
  "2eme": "2ème année",
  "3eme": "3ème année",
};
const CONFERENCE_LABELS: Record<string, string> = {
  confA: "Conférence A – ADHD",
  confB: "Conférence B – Interférences Pré-analytiques",
  confC: "Conférence C – ECG Normale",
  confD: "Conférence D – Réanimation Actualisée",
  tableRonde: "Table Ronde",
};
const ATELIER_LABELS: Record<string, string> = {
  atelier1: "Atelier 1 – Pansements Modernes",
  atelier2: "Atelier 2 – Suture",
  atelier3: "Atelier 3 – Plâtre",
  atelier4: "Atelier 4 – Réanimation Cardio-Respiratoire",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const headers = getCorsHeaders(req);

  try {
    const { nomPrenom, email, statut, niveauEtude, conferences, atelier, deviceId } = await req.json();

    // Validation
    if (typeof nomPrenom !== "string" || nomPrenom.trim().length === 0 || nomPrenom.length > 200) {
      return new Response(JSON.stringify({ error: "Nom et prénom invalides." }), { status: 400, headers });
    }
    if (typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Adresse e-mail invalide." }), { status: 400, headers });
    }
    if (!VALID_STATUTS.includes(statut)) {
      return new Response(JSON.stringify({ error: "Statut invalide." }), { status: 400, headers });
    }
    if (statut === "etudiant" && !VALID_NIVEAUX.includes(niveauEtude)) {
      return new Response(JSON.stringify({ error: "Niveau d'étude invalide." }), { status: 400, headers });
    }
    if (!Array.isArray(conferences) || !conferences.every((c: string) => VALID_CONFERENCES.includes(c))) {
      return new Response(JSON.stringify({ error: "Conférences invalides." }), { status: 400, headers });
    }
    if (atelier !== "" && atelier != null && !VALID_ATELIERS.includes(atelier)) {
      return new Response(JSON.stringify({ error: "Atelier invalide." }), { status: 400, headers });
    }

    const cleanNomPrenom = nomPrenom.trim().substring(0, 200);
    const cleanEmail = email.trim().toLowerCase().substring(0, 255);
    const cleanNiveau = statut === "etudiant" ? niveauEtude : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Atomic registration with capacity check
    const cleanDeviceId = typeof deviceId === "string" ? deviceId.trim().substring(0, 100) : null;

    const { data: result, error: rpcError } = await supabase.rpc("register_submission", {
      p_nom_prenom: cleanNomPrenom,
      p_email: cleanEmail,
      p_statut: statut,
      p_niveau_etude: cleanNiveau,
      p_conferences: conferences,
      p_atelier: atelier || null,
      p_device_id: cleanDeviceId,
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return new Response(JSON.stringify({ error: "Erreur d'enregistrement." }), { status: 500, headers });
    }

    if (!result?.success) {
      if (result?.error === "atelier_full") {
        return new Response(
          JSON.stringify({ error: "Cet atelier est complet (25/25). Veuillez en choisir un autre." }),
          { status: 409, headers }
        );
      }
      if (result?.error === "duplicate_email") {
        return new Response(
          JSON.stringify({ error: "Vous avez déjà soumis votre inscription avec cet e-mail." }),
          { status: 409, headers }
        );
      }
      if (result?.error === "duplicate_device") {
        return new Response(
          JSON.stringify({ error: "Une inscription a déjà été soumise depuis cet appareil." }),
          { status: 409, headers }
        );
      }
      return new Response(JSON.stringify({ error: "Inscription refusée." }), { status: 400, headers });
    }

    // Forward to Google Sheets (best-effort)
    const GOOGLE_SHEETS_WEBHOOK_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomPrenom: cleanNomPrenom,
            email: cleanEmail,
            statut: STATUT_LABELS[statut],
            niveauEtude: cleanNiveau ? NIVEAU_LABELS[cleanNiveau] : "",
            conferences: conferences.map((c: string) => CONFERENCE_LABELS[c]).join(", "),
            atelier: atelier ? ATELIER_LABELS[atelier] : "",
            date: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error("Google Sheets forward failed:", e);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error("Submit survey error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur." }), { status: 500, headers });
  }
});
