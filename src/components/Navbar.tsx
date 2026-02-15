import { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import logoBlack from "@/assets/logo-black.png";
import logoWhite from "@/assets/logo-white.png";

type OrnamentType = "lantern" | "crescent" | "star";

const Lantern = ({ color }: { color: string }) => (
  <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
    <line x1="9" y1="0" x2="9" y2="4" stroke={color} strokeWidth="1.5" />
    <path d="M6 4 Q6 2 9 2 Q12 2 12 4" stroke={color} strokeWidth="1" fill="none" />
    <rect x="5" y="4" width="8" height="12" rx="3" fill={color} opacity="0.85" />
    <rect x="7" y="6" width="4" height="8" rx="1.5" fill="white" opacity="0.2" />
    <path d="M5 16 Q9 20 13 16" stroke={color} strokeWidth="1" fill={color} opacity="0.85" />
  </svg>
);

const Crescent = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10 1C5.6 1 2 4.6 2 9s3.6 8 8 8c1.8 0 3.4-.6 4.8-1.5C13.2 14 12 11.6 12 9s1.2-5 2.8-6.5C13.4 1.6 11.8 1 10 1z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

const Star = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 0l1.8 4.6L14 5.2l-3.7 3.2 1.1 5.1L7 10.8 2.6 13.5l1.1-5.1L0 5.2l5.2-.6z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

const OrnamentIcon = ({ type, color }: { type: OrnamentType; color: string }) => {
  switch (type) {
    case "lantern": return <Lantern color={color} />;
    case "crescent": return <Crescent color={color} />;
    case "star": return <Star color={color} />;
  }
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Accueil", id: "hero" },
    { label: "À Propos", id: "about" },
    { label: "Réalisations", id: "achievements" },
    { label: "Objectifs", id: "goals" },
    { label: "Sponsors", id: "sponsors" },
    { label: "Contact", id: "contact" },
  ];

  const ornaments = useMemo(() => {
    const items: { type: OrnamentType; wireHeight: number; delay: string; size: "sm" | "md" | "lg" }[] = [
      { type: "star", wireHeight: 18, delay: "0s", size: "sm" },
      { type: "crescent", wireHeight: 30, delay: "0.4s", size: "md" },
      { type: "lantern", wireHeight: 42, delay: "0.8s", size: "lg" },
      { type: "star", wireHeight: 24, delay: "1.2s", size: "md" },
      { type: "lantern", wireHeight: 34, delay: "0.6s", size: "md" },
    ];
    return items;
  }, []);

  const goldColor = isScrolled ? "#B8922E" : "#D4A84B";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-background shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center space-x-3 transition-transform hover:scale-105"
          >
            <img
              src={isScrolled ? logoBlack : logoWhite}
              alt="White Line Club Logo"
              className="h-12 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm font-medium uppercase tracking-wider transition-colors relative group ${
                  isScrolled
                    ? "text-foreground hover:text-muted-foreground"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? "text-foreground hover:bg-secondary"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Ramadan Ornaments - Right Cluster */}
      {!isMobileMenuOpen && (
        <div className="absolute top-0 right-4 sm:right-12 lg:right-20 h-full pointer-events-none z-20 flex items-start">
          <div className="flex items-start gap-2 sm:gap-4 pt-0">
            {ornaments.map((ornament, i) => {
              // On mobile, only show first 3 ornaments with smaller sizes
              const mobileHidden = i >= 3 ? "hidden sm:flex" : "flex";
              return (
                <div
                  key={i}
                  className={`pointer-events-auto ramadan-ornament flex-col items-center ${mobileHidden}`}
                  style={{
                    animationDelay: ornament.delay,
                    transformOrigin: "top center",
                  }}
                >
                  {/* Wire */}
                  <div
                    style={{
                      width: 1,
                      height: ornament.wireHeight * (typeof window !== "undefined" && window.innerWidth < 640 ? 0.6 : 1),
                      backgroundColor: goldColor,
                      opacity: 0.5,
                    }}
                  />
                  {/* Ornament */}
                  <div className="-mt-1 scale-75 sm:scale-100">
                    <OrnamentIcon type={ornament.type} color={goldColor} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="bg-background border-t border-border px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="block w-full text-left text-foreground hover:text-muted-foreground font-medium uppercase tracking-wider transition-colors py-2"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
