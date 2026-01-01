import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SocialStats {
  followers: number;
  posts: number;
  totalLikes: number;
}

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

const AnimatedNumber = ({ value, suffix = "" }: AnimatedNumberProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

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
    <span ref={elementRef} className="font-display text-3xl sm:text-4xl">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

interface SocialCardProps {
  platform: "facebook" | "instagram";
  stats: SocialStats;
  isVisible: boolean;
  delay: number;
}

const SocialCard = ({ platform, stats, isVisible, delay }: SocialCardProps) => {
  const isFacebook = platform === "facebook";
  
  const platformConfig = {
    facebook: {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      link: "https://www.facebook.com/share/16ikmKFbhs/"
    },
    instagram: {
      name: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      link: "https://www.instagram.com/whiteline_issig/"
    }
  };

  const config = platformConfig[platform];

  return (
    <a
      href={config.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden bg-secondary/30 border-2 border-foreground/20 hover:border-foreground transition-all duration-500 p-8 ${
        isVisible ? "animate-slide-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 group-hover:text-background transition-colors duration-500">
        {/* Platform header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-foreground/10 group-hover:bg-background/20 transition-colors duration-500 rounded-lg">
            {config.icon}
          </div>
          <div>
            <h3 className="text-xl font-display tracking-wider">{config.name}</h3>
            <span className="text-sm text-muted-foreground group-hover:text-background/70 transition-colors duration-500">
              @whitelineclub
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-foreground/5 group-hover:bg-background/10 transition-colors duration-500">
            <AnimatedNumber value={stats.followers} />
            <p className="text-xs uppercase tracking-wider mt-2 text-muted-foreground group-hover:text-background/70 transition-colors duration-500">
              Abonnés
            </p>
          </div>
          <div className="text-center p-4 bg-foreground/5 group-hover:bg-background/10 transition-colors duration-500">
            <AnimatedNumber value={stats.posts} />
            <p className="text-xs uppercase tracking-wider mt-2 text-muted-foreground group-hover:text-background/70 transition-colors duration-500">
              Posts
            </p>
          </div>
          <div className="text-center p-4 bg-foreground/5 group-hover:bg-background/10 transition-colors duration-500">
            <AnimatedNumber value={stats.totalLikes} />
            <p className="text-xs uppercase tracking-wider mt-2 text-muted-foreground group-hover:text-background/70 transition-colors duration-500">
              Likes
            </p>
          </div>
        </div>

        {/* Follow button */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border border-foreground/30 group-hover:border-background/50 px-6 py-2 transition-all duration-500 group-hover:bg-background/20">
            Suivre
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
};

const SocialStats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [facebookStats, setFacebookStats] = useState<SocialStats>({ followers: 0, posts: 0, totalLikes: 0 });
  const [instagramStats, setInstagramStats] = useState<SocialStats>({ followers: 0, posts: 0, totalLikes: 0 });

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

  useEffect(() => {
    const fetchFacebookStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('facebook-stats');
        if (!error && data?.stats) {
          setFacebookStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching Facebook stats:', err);
      }
    };

    const fetchInstagramStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('instagram-stats');
        if (!error && data?.stats) {
          setInstagramStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching Instagram stats:', err);
      }
    };

    fetchFacebookStats();
    fetchInstagramStats();
  }, []);

  return (
    <section 
      id="social" 
      ref={sectionRef} 
      className="py-24 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-4xl sm:text-5xl font-display mb-6 tracking-wider">
            SUIVEZ-NOUS
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Restez connectés avec le White Line Club sur nos réseaux sociaux
          </p>
        </div>

        {/* Social cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SocialCard
            platform="facebook"
            stats={facebookStats}
            isVisible={isVisible}
            delay={100}
          />
          <SocialCard
            platform="instagram"
            stats={instagramStats}
            isVisible={isVisible}
            delay={200}
          />
        </div>
      </div>
    </section>
  );
};

export default SocialStats;
