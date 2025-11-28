import { useEffect, useRef, useState } from "react";
import { Users, Award, Heart, Target } from "lucide-react";

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
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
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
    <section id="about" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            QUI SOMMES-NOUS ?
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            White Line Club est une organisation étudiante dédiée à l'excellence en sciences infirmières. 
            Nous travaillons pour promouvoir la profession infirmière, développer les compétences de nos membres, 
            et contribuer au bien-être de notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatItem
            icon={<Users size={48} strokeWidth={1.5} />}
            value={150}
            suffix="+"
            label="Membres actifs"
          />
          <StatItem
            icon={<Award size={48} strokeWidth={1.5} />}
            value={25}
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
            value={10}
            suffix="+"
            label="Partenariats"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
