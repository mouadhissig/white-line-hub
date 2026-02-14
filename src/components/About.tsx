import { useEffect, useRef, useState } from "react";
import { Award, Heart, Target } from "lucide-react";
import RamadanDecor from "./RamadanDecor";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

const StatItem = ({ icon, value, label, suffix = "" }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, hasAnimated]);

  return (
    <div
      ref={elementRef}
      className="flex flex-col items-center p-8 bg-secondary/50 border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300 group"
    >
      <div className="mb-4 text-foreground group-hover:text-background transition-colors">
        {icon}
      </div>
      <div className="text-5xl font-display mb-2 animate-counter">
        {count}{suffix}
      </div>
      <div className="text-sm uppercase tracking-wider text-center">{label}</div>
    </div>
  );
};

const About = () => {
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

  return (
    <section id="about" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <RamadanDecor variant="a" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            QUI SOMMES-NOUS ?
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Le White Line Club est actuellement le seul club étudiant de l'Institut Supérieur des Sciences Infirmières de Gabès (ISSI Gabès). Il constitue un espace dynamique qui encourage la créativité, l'engagement et l'esprit d'initiative parmi les étudiants.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-4">
            Le club organise une large variété d'activités alliant santé, sensibilisation, divertissement et développement personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatItem
            icon={<Award size={48} strokeWidth={1.5} />}
            value={3}
            suffix="+"
            label="Événements organisés"
          />
          <StatItem
            icon={<Heart size={48} strokeWidth={1.5} />}
            value={500}
            suffix="+"
            label="Bénéficiaires"
          />
          <StatItem
            icon={<Target size={48} strokeWidth={1.5} />}
            value={5}
            suffix="+"
            label="Partenariats"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
