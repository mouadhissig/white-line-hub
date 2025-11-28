import { useEffect, useRef, useState } from "react";
import { Trophy, Calendar, Stethoscope, GraduationCap, HeartPulse, Handshake } from "lucide-react";

interface AchievementCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  delay?: number;
}

const AchievementCard = ({ icon, title, description, date, delay = 0 }: AchievementCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-background border-2 border-foreground p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
        isVisible ? "animate-scale-in" : "opacity-0"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-foreground transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="mb-6 text-foreground group-hover:text-background transition-colors">
          {icon}
        </div>
        
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground group-hover:text-background/80 transition-colors">
          <Calendar size={16} />
          <span>{date}</span>
        </div>
        
        <h3 className="text-2xl font-display mb-4 tracking-wide group-hover:text-background transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground group-hover:text-background/90 leading-relaxed transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
};

const Achievements = () => {
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

  const achievements = [
    {
      icon: <Trophy size={48} strokeWidth={1.5} />,
      title: "Journée Mondiale des Infirmiers",
      description: "Organisation d'un événement majeur célébrant la profession infirmière avec conférences et ateliers pratiques.",
      date: "Mai 2024",
    },
    {
      icon: <Stethoscope size={48} strokeWidth={1.5} />,
      title: "Campagne de Sensibilisation",
      description: "Sensibilisation à l'hygiène et la prévention des maladies dans les établissements scolaires de Gabès.",
      date: "Mars 2024",
    },
    {
      icon: <GraduationCap size={48} strokeWidth={1.5} />,
      title: "Formation Continue",
      description: "Sessions de formation avancée en soins d'urgence et techniques innovantes pour nos membres.",
      date: "Février 2024",
    },
    {
      icon: <HeartPulse size={48} strokeWidth={1.5} />,
      title: "Don de Sang",
      description: "Organisation de plusieurs campagnes de don de sang en collaboration avec les autorités sanitaires locales.",
      date: "Janvier 2024",
    },
    {
      icon: <Handshake size={48} strokeWidth={1.5} />,
      title: "Partenariat Hospitalier",
      description: "Établissement de partenariats avec les hôpitaux régionaux pour stages et formations pratiques.",
      date: "Décembre 2023",
    },
    {
      icon: <Trophy size={48} strokeWidth={1.5} />,
      title: "Prix d'Excellence",
      description: "Réception du prix de la meilleure association étudiante en sciences de la santé de la région.",
      date: "Novembre 2023",
    },
  ];

  return (
    <section id="achievements" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            NOS RÉALISATIONS
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez les projets et événements qui ont marqué notre parcours et démontré notre engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={index}
              {...achievement}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
