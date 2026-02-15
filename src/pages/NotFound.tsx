import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import MandalaDecor from "@/components/MandalaDecor";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <div className="flex items-center justify-center px-4 relative overflow-hidden" style={{ minHeight: "calc(100vh - 5rem)" }}>
        <MandalaDecor theme="light" variant="c" />
        <div className="text-center relative z-10">
          <h1 className="mb-4 text-6xl font-display tracking-wider">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Oops ! Page introuvable</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-background bg-foreground hover:bg-foreground/90 transition-all duration-300"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
