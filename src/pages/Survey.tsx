import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MandalaDecor from "@/components/MandalaDecor";
import { toast } from "@/hooks/use-toast";

type Statut = "etudiant" | "personnel" | "exterieur" | "comite";
type Niveau = "1ere" | "2eme" | "3eme";
type Conference = "confA" | "confB" | "confC" | "confD" | "tableRonde";
type Atelier = "atelier1" | "atelier2" | "atelier3" | "atelier4";

const DEFAULT_ATELIER_CAP = 25;
const DEVICE_ID_KEY = "wlc_survey_device_id";

const getDeviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `nostorage-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const ATELIERS: { id: Atelier; label: string }[] = [
  { id: "atelier1", label: "Atelier 1 – « Pansements Modernes »" },
  { id: "atelier2", label: "Atelier 2 – « Suture »" },
  { id: "atelier3", label: "Atelier 3 – « Plâtre »" },
  { id: "atelier4", label: "Atelier 4 – « Réanimation Cardio-Respiratoire »" },
];

const CONFERENCES: { id: Conference; label: string }[] = [
  { id: "confA", label: "Conférence A – « Trouble Déficitaire de l'Attention avec ou sans Hyperactivité » (ADHD – 9h00)" },
  { id: "confB", label: "Conférence B – « Sources d'Erreurs Silencieuses au Laboratoire » (Interférences Pré-analytiques – 9h30)" },
  { id: "confC", label: "Conférence C – « Reconnaître un Tracé Normal pour Mieux Détecter l'Anormal » (ECG Normale – 10h30)" },
  { id: "confD", label: "Conférence D – « Réanimation Actualisée et Rôle Infirmier » (11h00)" },
  { id: "tableRonde", label: "Table Ronde – « Discussions Interactives avec les Experts » (11h30)" },
];

const AdminPanel = ({ currentCap }: { currentCap: number }) => {
  const [resetKey, setResetKey] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [capKey, setCapKey] = useState("");
  const [capValue, setCapValue] = useState<string>(String(currentCap));
  const [isSavingCap, setIsSavingCap] = useState(false);

  useEffect(() => {
    setCapValue(String(currentCap));
  }, [currentCap]);

  const handleReset = async () => {
    if (!resetKey) return;
    setIsResetting(true);
    try {
      const { error } = await supabase.functions.invoke("reset-survey", { body: { adminKey: resetKey } });
      if (error) throw error;
      toast({ title: "Succès", description: "Les inscriptions ont été réinitialisées." });
      setResetKey("");
    } catch {
      toast({ title: "Erreur", description: "Mot de passe incorrect ou erreur serveur.", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveCap = async () => {
    const cap = Number(capValue);
    if (!capKey || !Number.isInteger(cap) || cap < 1 || cap > 1000) {
      toast({ title: "Erreur", description: "Capacité invalide (1-1000) ou mot de passe manquant.", variant: "destructive" });
      return;
    }
    setIsSavingCap(true);
    try {
      const { error } = await supabase.functions.invoke("update-survey-settings", {
        body: { adminKey: capKey, atelierCap: cap },
      });
      if (error) throw error;
      toast({ title: "Succès", description: `Capacité mise à jour : ${cap} par atelier.` });
      setCapKey("");
    } catch {
      toast({ title: "Erreur", description: "Mot de passe incorrect ou erreur serveur.", variant: "destructive" });
    } finally {
      setIsSavingCap(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 p-4 border-2 border-destructive/50 bg-destructive/5 relative z-10 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert size={20} className="text-destructive" />
        <span className="text-sm font-medium uppercase tracking-wider text-destructive">Admin</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-destructive/80">Réinitialiser les inscriptions</p>
        <div className="flex gap-3">
          <input
            type="password"
            value={resetKey}
            onChange={(e) => setResetKey(e.target.value)}
            placeholder="Mot de passe admin"
            className="flex-1 px-4 py-2 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors text-sm"
          />
          <button
            onClick={handleReset}
            disabled={isResetting || !resetKey}
            className="px-4 py-2 bg-destructive text-destructive-foreground text-sm uppercase tracking-wider hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? "..." : "Réinitialiser"}
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-destructive/30">
        <p className="text-xs uppercase tracking-wider text-destructive/80">
          Capacité par atelier (actuelle : {currentCap})
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min={1}
            max={1000}
            value={capValue}
            onChange={(e) => setCapValue(e.target.value)}
            placeholder="Capacité"
            className="w-full sm:w-28 px-4 py-2 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors text-sm"
          />
          <input
            type="password"
            value={capKey}
            onChange={(e) => setCapKey(e.target.value)}
            placeholder="Mot de passe admin"
            className="flex-1 px-4 py-2 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors text-sm"
          />
          <button
            onClick={handleSaveCap}
            disabled={isSavingCap || !capKey}
            className="px-4 py-2 bg-foreground text-background text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingCap ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Survey = () => {
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [nomPrenom, setNomPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [statut, setStatut] = useState<Statut | "">("");
  const [niveauEtude, setNiveauEtude] = useState<Niveau | "">("");
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [atelier, setAtelier] = useState<Atelier | "">("");
  const [confirmAtelier, setConfirmAtelier] = useState(false);

  // Live counts per atelier
  const [atelierCap, setAtelierCap] = useState(DEFAULT_ATELIER_CAP);
  const [counts, setCounts] = useState<Record<Atelier, number>>({
    atelier1: 0, atelier2: 0, atelier3: 0, atelier4: 0,
  });

  const fetchCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_submissions")
        .select("atelier");
      if (error) {
        console.error("Erreur de chargement des compteurs:", error);
        return;
      }
      const next: Record<Atelier, number> = { atelier1: 0, atelier2: 0, atelier3: 0, atelier4: 0 };
      for (const row of data ?? []) {
        const a = row.atelier as Atelier;
        if (a in next) next[a]++;
      }
      setCounts(next);
    } catch (err) {
      console.error("Impossible de récupérer les compteurs:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Live updates via Supabase Realtime — instant for inserts AND admin resets
    const channel = supabase
      .channel("survey-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "survey_submissions" },
        () => fetchCounts()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleConference = (c: Conference) => {
    setConferences((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nomPrenom || !email || !statut) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    if (statut === "etudiant" && !niveauEtude) {
      setError("Veuillez sélectionner votre niveau d'étude.");
      return;
    }
    if (!atelier) {
      setError("Veuillez sélectionner un atelier.");
      return;
    }
    if (counts[atelier] >= atelierCap) {
      setError("Cet atelier est complet. Veuillez en choisir un autre.");
      return;
    }
    if (!confirmAtelier) {
      setError("Veuillez confirmer votre choix d'atelier.");
      return;
    }

    setIsSubmitting(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          nomPrenom: nomPrenom.trim().substring(0, 200),
          email: email.trim().toLowerCase().substring(0, 255),
          statut,
          niveauEtude: statut === "etudiant" ? niveauEtude : null,
          conferences,
          atelier,
          deviceId: getDeviceId(),
        }),
      });

      const payload = await res.json().catch(() => ({} as { error?: string; success?: boolean }));

      if (!res.ok || payload?.error) {
        setError(payload?.error || "Une erreur s'est produite. Veuillez réessayer.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Une erreur réseau s'est produite. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-foreground text-background flex items-center justify-center px-4 relative overflow-hidden">
        <MandalaDecor theme="dark" variant="a" />
        <div className="max-w-md w-full text-center space-y-8 animate-scale-in relative z-10">
          <CheckCircle2 size={64} className="mx-auto" strokeWidth={1.5} />
          <h1 className="text-3xl font-display tracking-wider">MERCI !</h1>
          <p className="text-background/80 text-lg leading-relaxed">
            Votre inscription a été enregistrée avec succès.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border-2 border-background px-6 py-3 text-sm uppercase tracking-wider hover:bg-background hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <MandalaDecor theme="light" variant="b" />
        <div className="max-w-2xl mx-auto relative z-10">
          {isAdmin && <AdminPanel />}

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-display tracking-wider mb-4">
              JOURNÉE DE L'INFIRMIER
            </h1>
            <div className="w-16 h-1 bg-foreground mx-auto mb-6" />
            <p className="text-muted-foreground text-base sm:text-lg">
              « Infirmier en Action : Savoir, Soins et Compétences »
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              2 Mai 2026 – Complexe ElChella, Chneni (8h30) / L'Institut (14h30)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Informations personnelles */}
            <section className="space-y-6">
              <h2 className="text-xl font-display tracking-wider border-b-2 border-foreground pb-2">
                INFORMATIONS PERSONNELLES
              </h2>

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider">
                  Nom et prénom <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nomPrenom}
                  onChange={(e) => setNomPrenom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                  placeholder="Nom et prénom"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider">
                  Adresse e-mail <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium uppercase tracking-wider">
                  Statut <span className="text-destructive">*</span>
                </label>
                {([
                  ["etudiant", "Étudiant"],
                  ["personnel", "Personnel de la faculté"],
                  ["exterieur", "Extérieur"],
                  ["comite", "Membre du comité d'organisation"],
                ] as [Statut, string][]).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 px-4 py-3 border-2 border-foreground cursor-pointer transition-all duration-300 hover:bg-foreground/5"
                  >
                    <input
                      type="radio"
                      name="statut"
                      checked={statut === value}
                      onChange={() => setStatut(value)}
                      className="w-5 h-5 accent-foreground cursor-pointer"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>

              {statut === "etudiant" && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-sm font-medium uppercase tracking-wider">
                    Niveau d'étude <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={niveauEtude}
                    onChange={(e) => setNiveauEtude(e.target.value as Niveau)}
                    className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Sélectionnez votre année</option>
                    <option value="1ere">1ère année</option>
                    <option value="2eme">2ème année</option>
                    <option value="3eme">3ème année</option>
                  </select>
                </div>
              )}
            </section>

            {/* Matinée - Conférences */}
            <section className="space-y-4">
              <h2 className="text-xl font-display tracking-wider border-b-2 border-foreground pb-2">
                MATINÉE – CONFÉRENCES
              </h2>
              <p className="text-sm text-muted-foreground">
                Complexe ElChella, Chneni – à partir de 8h30. Sélectionnez la/les conférence(s) souhaitée(s).
              </p>
              <div className="space-y-3">
                {CONFERENCES.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-start gap-3 px-4 py-3 border-2 border-foreground cursor-pointer transition-all duration-300 hover:bg-foreground/5"
                  >
                    <input
                      type="checkbox"
                      checked={conferences.includes(c.id)}
                      onChange={() => toggleConference(c.id)}
                      className="w-5 h-5 mt-0.5 accent-foreground cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm font-medium">{c.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Après-midi - Ateliers */}
            <section className="space-y-4">
              <h2 className="text-xl font-display tracking-wider border-b-2 border-foreground pb-2">
                APRÈS-MIDI – ATELIERS PRATIQUES
              </h2>
              <p className="text-sm text-muted-foreground">
                L'Institut – à partir de 14h30. ⚠️ La présence en atelier est obligatoire. Veuillez choisir un seul atelier.
              </p>
              <div className="space-y-3">
                {ATELIERS.map((a) => {
                  const count = counts[a.id];
                  const isFull = count >= atelierCap;
                  return (
                    <label
                      key={a.id}
                      className={`flex items-center justify-between gap-3 px-4 py-3 border-2 border-foreground transition-all duration-300 ${
                        isFull
                          ? "opacity-50 cursor-not-allowed bg-foreground/5"
                          : "cursor-pointer hover:bg-foreground/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="radio"
                          name="atelier"
                          checked={atelier === a.id}
                          onChange={() => !isFull && setAtelier(a.id)}
                          disabled={isFull}
                          className="w-5 h-5 accent-foreground cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-medium">{a.label}</span>
                      </div>
                      <span
                        className={`text-xs font-mono px-2 py-1 border ${
                          isFull
                            ? "border-destructive text-destructive"
                            : "border-foreground/40 text-foreground/70"
                        }`}
                      >
                        {isFull ? "COMPLET" : `${count}/${atelierCap}`}
                      </span>
                    </label>
                  );
                })}
              </div>

              <label className="flex items-start gap-3 px-4 py-3 border-2 border-foreground cursor-pointer transition-all duration-300 hover:bg-foreground/5 mt-4">
                <input
                  type="checkbox"
                  checked={confirmAtelier}
                  onChange={(e) => setConfirmAtelier(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-foreground cursor-pointer flex-shrink-0"
                />
                <span className="text-sm font-medium">
                  Oui, je confirme que je participerai à l'atelier sélectionné. <span className="text-destructive">*</span>
                </span>
              </label>
            </section>

            {error && <p className="text-destructive text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-4 px-8 font-medium uppercase tracking-wider hover:bg-foreground/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer mon inscription"}
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Survey;
