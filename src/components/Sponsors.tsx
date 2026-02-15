import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import MandalaDecor from "./MandalaDecor";

const Sponsors = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const sponsorSlots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <section id="sponsors" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-foreground text-background overflow-hidden relative">
      <MandalaDecor theme="dark" variant="b" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            NOS SPONSORS
          </h2>
          <div className="w-24 h-1 bg-background mx-auto mb-8" />
          <p className="text-lg text-background/80 max-w-3xl mx-auto leading-relaxed">
            Nous remercions nos partenaires et sponsors qui nous soutiennent dans notre mission.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-8 animate-scroll-left">
            {[...sponsorSlots, ...sponsorSlots].map((slot, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-48 h-48 border-2 border-background/20 flex items-center justify-center hover:border-background hover:bg-background/5 transition-all duration-300 group"
              >
                <div className="text-center">
                  <Building2 size={48} className="mx-auto mb-2 text-background/30 group-hover:text-background/60 transition-colors" strokeWidth={1.5} />
                  <p className="text-sm text-background/50 group-hover:text-background/70 transition-colors uppercase tracking-wider">
                    Sponsor {(slot % 8) + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`text-center mt-12 ${isVisible ? "animate-slide-up" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
          <p className="text-background/70 mb-6">
            Vous souhaitez devenir sponsor ?
          </p>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-background text-foreground hover:bg-background/90 transition-all duration-300"
          >
            Contactez-nous
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
