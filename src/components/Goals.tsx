import { useEffect, useRef, useState } from "react";
import { Lightbulb, Users, TrendingUp, Globe, BookOpen, Sparkles } from "lucide-react";
import RamadanDecor from "./RamadanDecor";
import MandalaDecor from "./MandalaDecor";

interface GoalItemProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const GoalItem = ({ number, icon, title, description, delay = 0 }: GoalItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={itemRef}
      className={`flex gap-6 group ${isVisible ? "animate-slide-left" : "opacity-0"}`}
    >
      {/* Number */}
      <div className="flex-shrink-0 w-20 h-20 border-4 border-foreground flex items-center justify-center bg-background group-hover:bg-foreground transition-all duration-300">
        <span className="text-3xl font-display group-hover:text-background transition-colors">
          {number}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 border-2 border-foreground p-6 bg-background group-hover:border-foreground/50 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="text-foreground mt-1">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-display mb-3 tracking-wide">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Goals = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const goals = [
    {
      icon: <Lightbulb size={32} strokeWidth={1.5} />,
      title: "Sensibilisation et Éducation Sanitaire",
      description: "La mise en place de campagnes de sensibilisation et d'éducation sanitaire destinées aux étudiants et à la communauté.",
    },
    {
      icon: <Globe size={32} strokeWidth={1.5} />,
      title: "Participation aux Événements",
      description: "La participation à des événements nationaux et internationaux liés à la santé.",
    },
    {
      icon: <Users size={32} strokeWidth={1.5} />,
      title: "Activités Ludiques et Récréatives",
      description: "L'organisation d'activités ludiques et récréatives afin de renforcer la cohésion entre les étudiants.",
    },
    {
      icon: <TrendingUp size={32} strokeWidth={1.5} />,
      title: "Développement des Compétences",
      description: "Le développement des compétences des membres à travers des ateliers portant sur la communication, le leadership, le travail en équipe et l'organisation.",
    },
  ];

  return (
    <section id="goals" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <RamadanDecor variant="b" />
      <MandalaDecor theme="light" variant="d" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            NOS OBJECTIFS
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Notre vision pour l'avenir : des objectifs ambitieux pour transformer l'éducation infirmière et servir notre communauté.
          </p>
        </div>

        <div className="space-y-8">
          {goals.map((goal, index) => (
            <GoalItem
              key={index}
              number={`0${index + 1}`}
              {...goal}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Goals;
