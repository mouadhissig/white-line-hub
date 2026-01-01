import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import SocialStats from "@/components/SocialStats";
import Achievements from "@/components/Achievements";
import Goals from "@/components/Goals";
import Sponsors from "@/components/Sponsors";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="smooth-scroll">
      <Navbar />
      <Hero />
      <About />
      <SocialStats />
      <Achievements />
      <Goals />
      <Sponsors />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
