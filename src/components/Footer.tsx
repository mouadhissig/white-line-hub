import logo from "@/assets/logo.png";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <img src={logo} alt="White Line Club" className="h-16 w-auto invert" />
          
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
