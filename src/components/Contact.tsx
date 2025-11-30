import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Facebook, Instagram, Linkedin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            CONTACTEZ-NOUS
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une question ? Un projet ? N'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`space-y-8 ${isVisible ? "animate-slide-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            <div className="border-2 border-foreground p-8 bg-background hover:bg-foreground hover:text-background transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <Mail size={32} strokeWidth={1.5} className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-display mb-2 tracking-wide">Email</h3>
                  <a href="mailto:contact@whitelineissig.me" className="text-muted-foreground group-hover:text-background/90 hover:underline">
                    contact@whitelineissig.me
                  </a>
                </div>
              </div>
            </div>

            <div className="border-2 border-foreground p-8 bg-background hover:bg-foreground hover:text-background transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <MapPin size={32} strokeWidth={1.5} className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-display mb-2 tracking-wide">Adresse</h3>
                  <p className="text-muted-foreground group-hover:text-background/90">
                    L'Institut Supérieur de Sciences Infirmières<br />
                    Gabès, Tunisie
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-8">
              <h3 className="text-2xl font-display mb-6 tracking-wide">Suivez-nous</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=156324860887838"
}"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={24} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.instagram.com/whiteline_issig/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={24} strokeWidth={1.5} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="peer w-full px-4 py-4 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-4 text-muted-foreground transition-all peer-focus:-translate-y-8 peer-focus:text-sm peer-focus:text-foreground peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-foreground pointer-events-none">
                Nom complet
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="peer w-full px-4 py-4 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-4 text-muted-foreground transition-all peer-focus:-translate-y-8 peer-focus:text-sm peer-focus:text-foreground peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-foreground pointer-events-none">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="peer w-full px-4 py-4 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-4 text-muted-foreground transition-all peer-focus:-translate-y-8 peer-focus:text-sm peer-focus:text-foreground peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-foreground pointer-events-none">
                Sujet
              </label>
            </div>

            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="peer w-full px-4 py-4 border-2 border-foreground bg-transparent focus:outline-none focus:border-foreground/50 transition-colors resize-none"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-4 text-muted-foreground transition-all peer-focus:-translate-y-8 peer-focus:text-sm peer-focus:text-foreground peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-foreground pointer-events-none">
                Message
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-4 px-8 font-medium uppercase tracking-wider hover:bg-foreground/90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Envoyer
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
