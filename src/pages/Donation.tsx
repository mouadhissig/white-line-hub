import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MandalaDecor from "@/components/MandalaDecor";

const Donation = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-4 pt-28 pb-16 relative overflow-hidden" style={{ minHeight: "calc(100vh - 5rem)" }}>
        <MandalaDecor theme="light" variant="d" />

        {/* Cute anime chibi character - construction worker */}
        <div className="relative animate-bounce-slow z-10">
          <svg
            viewBox="0 0 200 200"
            className="w-64 h-64 sm:w-80 sm:h-80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hard hat */}
            <ellipse cx="100" cy="50" rx="55" ry="20" fill="#FFD93D" />
            <path d="M45 50 Q45 30 100 25 Q155 30 155 50" fill="#FFD93D" stroke="#E8B800" strokeWidth="2" />
            <rect x="90" y="20" width="20" height="10" rx="3" fill="#FFD93D" />
            
            {/* Face */}
            <circle cx="100" cy="90" r="45" fill="#FFE5D9" />
            
            {/* Blush */}
            <ellipse cx="70" cy="100" rx="10" ry="6" fill="#FFB5B5" opacity="0.6" />
            <ellipse cx="130" cy="100" rx="10" ry="6" fill="#FFB5B5" opacity="0.6" />
            
            {/* Eyes - big and cute */}
            <ellipse cx="80" cy="90" rx="12" ry="14" fill="white" />
            <ellipse cx="120" cy="90" rx="12" ry="14" fill="white" />
            <circle cx="82" cy="92" r="8" fill="#4A4A4A" />
            <circle cx="122" cy="92" r="8" fill="#4A4A4A" />
            <circle cx="85" cy="89" r="3" fill="white" />
            <circle cx="125" cy="89" r="3" fill="white" />
            
            {/* Eyebrows */}
            <path d="M68 75 Q80 72 90 75" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M110 75 Q120 72 132 75" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Cute smile */}
            <path d="M88 110 Q100 120 112 110" stroke="#4A4A4A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Body - construction vest */}
            <path d="M60 135 Q60 165 70 180 L130 180 Q140 165 140 135 Q120 145 100 145 Q80 145 60 135" fill="#FF8C00" />
            <rect x="85" y="145" width="30" height="35" fill="#FFD93D" />
            
            {/* Arms holding sign */}
            <ellipse cx="50" cy="155" rx="12" ry="10" fill="#FFE5D9" />
            <ellipse cx="150" cy="155" rx="12" ry="10" fill="#FFE5D9" />
            
            {/* Construction sign */}
            <rect x="35" y="165" width="130" height="30" rx="3" fill="#FFD93D" stroke="#E8B800" strokeWidth="2" />
            <line x1="50" y1="165" x2="50" y2="195" stroke="#4A4A4A" strokeWidth="3" />
            <line x1="150" y1="165" x2="150" y2="195" stroke="#4A4A4A" strokeWidth="3" />
          </svg>
          
          {/* Floating sparkles */}
          <div className="absolute -top-4 -left-4 text-2xl animate-pulse">✨</div>
          <div className="absolute -top-2 -right-6 text-xl animate-pulse" style={{ animationDelay: "0.5s" }}>⭐</div>
          <div className="absolute top-10 -right-8 text-lg animate-pulse" style={{ animationDelay: "1s" }}>✨</div>
        </div>

        {/* Text */}
        <div className="text-center mt-8 space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-display tracking-wider text-foreground">
            En Construction
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Cette page est en cours de développement. Revenez bientôt pour découvrir comment soutenir le White Line Club ! 💖
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-2 pt-4">
            <span className="w-3 h-3 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <span className="w-3 h-3 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <span className="w-3 h-3 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>

        {/* Home button */}
        <Link
          to="/"
          className="mt-10 inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-background bg-foreground rounded-none hover:bg-foreground/90 transition-all duration-300 relative z-10"
        >
          Retour à l'accueil
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Donation;
