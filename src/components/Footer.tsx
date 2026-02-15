import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Heart, ClipboardList } from "lucide-react";
import MandalaDecor from "./MandalaDecor";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <MandalaDecor theme="dark" variant="c" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <img src={logo} alt="White Line Club" className="h-16 w-auto invert" />

          <Link
            to="/survey"
            className="inline-flex items-center gap-2 border-2 border-background px-6 py-3 text-sm uppercase tracking-wider hover:bg-background hover:text-foreground transition-all duration-300"
          >
            <ClipboardList size={18} />
            Formulaire d'inscription
          </Link>
          
          <div className="flex items-center gap-2 text-sm">
            <span>Fait avec</span>
            <Heart size={16} className="fill-current" />
            <span>par White Line Club</span>
          </div>

          <div className="text-sm text-background/70">
            © {new Date().getFullYear()} White Line Club - ISSIG Gabès. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
