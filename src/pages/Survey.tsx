import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo-white.png";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MandalaDecor from "@/components/MandalaDecor";

type Formation = "sutures" | "platrage";

const Survey = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [anneeEtude, setAnneeEtude] = useState("");
  const [formations, setFormations] = useState<Formation[]>([]);

  const toggleFormation = (f: Formation) => {
    setFormations((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nom || !prenom || !email || !telephone || !anneeEtude) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    if (formations.length === 0) {
      setError("Veuillez sélectionner au moins une formation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: fnError } = await supabase.functions.invoke("submit-survey", {
        body: {
          nom: nom.trim().substring(0, 100),
          prenom: prenom.trim().substring(0, 100),
          email: email.trim().substring(0, 255),
          telephone: telephone.trim().substring(0, 20),
          anneeEtude,
          formations,
        },
      });

      if (fnError) throw new Error("Erreur lors de l'envoi.");
      setSubmitted(true);
    } catch {
      setError("Une erreur s'est produite. Veuillez réessayer.");
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
            Merci pour votre participation ! Votre réponse a été enregistrée avec succès.
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

      {/* Form */}
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <MandalaDecor theme="light" variant="b" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display tracking-wider mb-4">INSCRIPTION</h1>
            <div className="w-16 h-1 bg-foreground mx-auto mb-6" />
            <p className="text-muted-foreground text-lg">
              Remplissez le formulaire ci-dessous pour participer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nom & Prénom */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider">
                  Nom <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-wider">
                  Prénom <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                  placeholder="Votre prénom"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Téléphone */}
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider">
                Numéro de téléphone <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder="+216 XX XXX XXX"
                required
              />
            </div>

            {/* Année d'étude */}
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider">
                Année d'étude <span className="text-destructive">*</span>
              </label>
              <select
                value={anneeEtude}
                onChange={(e) => setAnneeEtude(e.target.value)}
                className="w-full px-4 py-3 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors appearance-none cursor-pointer"
                required
              >
                <option value="">Sélectionnez votre année</option>
                <option value="1ère année">1ère année</option>
                <option value="2ème année">2ème année</option>
                <option value="3ème année">3ème année</option>
              </select>
            </div>

            {/* Formations */}
            <div className="space-y-4">
              <label className="text-sm font-medium uppercase tracking-wider">
                Quelle formation souhaitez-vous suivre ? <span className="text-destructive">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-foreground cursor-pointer transition-all duration-300 hover:bg-foreground/5">
                  <input
                    type="checkbox"
                    checked={formations.includes("sutures")}
                    onChange={() => toggleFormation("sutures")}
                    className="w-5 h-5 accent-foreground cursor-pointer"
                  />
                  <span className="text-sm font-medium">Les sutures médicales</span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-foreground cursor-pointer transition-all duration-300 hover:bg-foreground/5">
                  <input
                    type="checkbox"
                    checked={formations.includes("platrage")}
                    onChange={() => toggleFormation("platrage")}
                    className="w-5 h-5 accent-foreground cursor-pointer"
                  />
                  <span className="text-sm font-medium">Le plâtrage (pose de plâtre)</span>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-4 px-8 font-medium uppercase tracking-wider hover:bg-foreground/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Survey;
