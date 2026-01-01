import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MaintenanceMode from "@/components/MaintenanceMode";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

const MAINTENANCE_MODE = true; // Auf false setzen um die Seite öffentlich zu machen

const Index = () => {
  const { isAdmin, isLoading } = useAuth();

  // Wartungsmodus: Nur Admins können die Seite sehen
  if (MAINTENANCE_MODE && !isAdmin && !isLoading) {
    return <MaintenanceMode />;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <About />
          <Portfolio />
          <Services />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
