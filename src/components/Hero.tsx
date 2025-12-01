import { useEffect, useRef } from "react";
import issigWhite from "@/assets/issig-white.png";

const Hero = () => {
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!shapesRef.current) return;
      const shapes = shapesRef.current.querySelectorAll(".floating-shape");
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      shapes.forEach((shape, index) => {
        const element = shape as HTMLElement;
        const speed = (index + 1) * 0.02;
        const x = (clientX - centerX) * speed;
        const y = (clientY - centerY) * speed;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Animated Background Shapes */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none">
        {/* Circle - inspired by caduceus center */}
        <div className="floating-shape absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white/10 rounded-full animate-float" style={{ animationDelay: "0s" }} />
        <div className="floating-shape absolute top-1/3 right-1/4 w-24 h-24 border-4 border-white/10 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        
        {/* Lines - inspired by caduceus staff and wings */}
        <div className="floating-shape absolute top-1/2 left-1/3 w-48 h-1 bg-white/10 rotate-45 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="floating-shape absolute bottom-1/3 right-1/3 w-64 h-1 bg-white/10 -rotate-45 animate-float" style={{ animationDelay: "1.5s" }} />
        
        {/* More geometric elements */}
        <div className="floating-shape absolute top-2/3 left-1/2 w-20 h-20 border-4 border-white/10 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="floating-shape absolute bottom-1/4 left-1/5 w-40 h-1 bg-white/10 rotate-12 animate-float" style={{ animationDelay: "2.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="animate-scale-in">
          <img
            src={issigWhite}
            alt="White Line Club - ISSIG"
            className="mx-auto mb-8 w-full max-w-md h-auto"
          />
        </div>

        <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
          L'Institut Supérieur de Sciences Infirmières Gabès
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-black bg-white rounded-none hover:bg-gray-100 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            Découvrir
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          
          <a
            href="https://surveyheart.com/form/690e7a48860f44495212aa90"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-transparent border-2 border-white rounded-none hover:bg-white hover:text-black transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            Répondre au sondage
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
