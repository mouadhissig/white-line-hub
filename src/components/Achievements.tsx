import { useEffect, useRef, useState } from "react";
import { Calendar, ExternalLink, Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface AchievementCardProps {
  post: FacebookPost;
  delay?: number;
}

const AchievementCard = ({ post, delay = 0 }: AchievementCardProps) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const truncateMessage = (message: string, maxLength: number = 200) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const likesCount = post.reactions?.summary?.total_count || 0;
  const commentsCount = post.comments?.summary?.total_count || 0;
  const sharesCount = post.shares?.count || 0;

  return (
    <div
      ref={cardRef}
      className={`group relative bg-background border-2 border-foreground transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${
        isVisible ? "animate-scale-in" : "opacity-0"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-foreground transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
      
      <div className="relative z-10">
        {post.full_picture && (
          <div className="relative w-full h-64 overflow-hidden">
            <img 
              src={post.full_picture} 
              alt="Facebook post" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground group-hover:text-background/80 transition-colors">
            <Calendar size={16} />
            <span>{formatDate(post.created_time)}</span>
          </div>
          
          {post.message && (
            <p className="text-muted-foreground group-hover:text-background/90 leading-relaxed mb-4 transition-colors">
              {truncateMessage(post.message)}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <a
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground group-hover:text-background font-medium transition-colors"
            >
              Voir sur Facebook
              <ExternalLink size={16} />
            </a>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Heart size={14} className="text-red-500" />
                <span className="font-medium text-foreground group-hover:text-background transition-colors">{likesCount}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <MessageCircle size={14} className="text-blue-500" />
                <span className="font-medium text-foreground group-hover:text-background transition-colors">{commentsCount}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Share2 size={14} className="text-green-500" />
                <span className="font-medium text-foreground group-hover:text-background transition-colors">{sharesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Achievements = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('facebook-posts');
        if (!error && data?.posts) {
          setPosts(data.posts.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching Facebook posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section id="achievements" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-5xl sm:text-6xl font-display mb-6 tracking-wider">
            NOS RÉALISATIONS
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez nos dernières actualités et événements sur Facebook.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">
            Chargement des publications...
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <AchievementCard
                key={post.id}
                post={post}
                delay={index * 100}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Aucune publication disponible pour le moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements;
