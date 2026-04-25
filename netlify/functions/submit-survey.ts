import { Handler, HandlerEvent } from '@netlify/functions';

const VALID_STATUTS = ['etudiant', 'personnel', 'exterieur', 'comite'];
const VALID_NIVEAUX = ['1ere', '2eme', '3eme'];
const VALID_CONFERENCES = ['confA', 'confB', 'confC', 'confD', 'tableRonde'];
const VALID_ATELIERS = ['atelier1', 'atelier2', 'atelier3', 'atelier4'];

const STATUT_LABELS: Record<string, string> = {
  etudiant: 'Étudiant',
  personnel: 'Personnel de la faculté',
  exterieur: 'Extérieur',
  comite: "Membre du comité d'organisation",
};
const NIVEAU_LABELS: Record<string, string> = {
  '1ere': '1ère année',
  '2eme': '2ème année',
  '3eme': '3ème année',
};
const CONFERENCE_LABELS: Record<string, string> = {
  confA: 'Conférence A – ADHD',
  confB: 'Conférence B – Interférences Pré-analytiques',
  confC: 'Conférence C – ECG Normale',
  confD: 'Conférence D – Réanimation Actualisée',
  tableRonde: 'Table Ronde',
};
const ATELIER_LABELS: Record<string, string> = {
  atelier1: 'Atelier 1 – Pansements Modernes',
  atelier2: 'Atelier 2 – Suture',
  atelier3: 'Atelier 3 – Plâtre',
  atelier4: 'Atelier 4 – Réanimation Cardio-Respiratoire',
};

const handler: Handler = async (event: HandlerEvent) => {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { ...jsonHeaders, Allow: 'POST' },
    };
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Configuration serveur manquante.' }),
      headers: jsonHeaders,
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Corps de requête manquant.' }),
      headers: jsonHeaders,
    };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'JSON invalide.' }),
      headers: jsonHeaders,
    };
  }

  const { nomPrenom, email, statut, niveauEtude, conferences, atelier } = payload;

  // Validation
  if (typeof nomPrenom !== 'string' || nomPrenom.trim().length === 0 || nomPrenom.length > 200) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nom et prénom invalides.' }),
      headers: jsonHeaders,
    };
  }
  if (typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Adresse e-mail invalide.' }),
      headers: jsonHeaders,
    };
  }
  if (typeof statut !== 'string' || !VALID_STATUTS.includes(statut)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Statut invalide.' }),
      headers: jsonHeaders,
    };
  }
  if (statut === 'etudiant' && (typeof niveauEtude !== 'string' || !VALID_NIVEAUX.includes(niveauEtude))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Niveau d'étude invalide." }),
      headers: jsonHeaders,
    };
  }
  if (!Array.isArray(conferences) || !conferences.every((c) => VALID_CONFERENCES.includes(c as string))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Conférences invalides.' }),
      headers: jsonHeaders,
    };
  }
  if (typeof atelier !== 'string' || !VALID_ATELIERS.includes(atelier)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Atelier invalide.' }),
      headers: jsonHeaders,
    };
  }

  const cleanNomPrenom = (nomPrenom as string).trim().substring(0, 200);
  const cleanEmail = (email as string).trim().toLowerCase().substring(0, 255);
  const cleanNiveau = statut === 'etudiant' ? (niveauEtude as string) : '';

  const sheetsPayload = {
    nomPrenom: cleanNomPrenom,
    email: cleanEmail,
    statut: STATUT_LABELS[statut] ?? statut,
    niveauEtude: cleanNiveau ? (NIVEAU_LABELS[cleanNiveau] ?? cleanNiveau) : '',
    conferences: (conferences as string[]).map((c) => CONFERENCE_LABELS[c] ?? c).join(', '),
    atelier: ATELIER_LABELS[atelier as string] ?? (atelier as string),
    date: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetsPayload),
      redirect: 'follow',
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`Google Apps Script returned HTTP ${response.status}: ${body}`);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Erreur lors de l'envoi au webhook (statut " + response.status + ').' }),
        headers: jsonHeaders,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: jsonHeaders,
    };
  } catch (err) {
    console.error('Erreur réseau vers Google Apps Script:', err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Impossible de joindre le webhook d'inscription." }),
      headers: jsonHeaders,
    };
  }
};

export { handler };
