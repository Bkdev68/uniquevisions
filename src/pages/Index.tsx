import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();

  // Fetch maintenance mode setting from database
  const { data: maintenanceMode, isLoading: settingsLoading } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      
      if (error) throw error;
      // Default to maintenance mode ON if no setting exists
      return data?.value !== "false";
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const isLoading = authLoading || settingsLoading;

  // Wartungsmodus: Nur Admins können die Seite sehen
  if (!isLoading && maintenanceMode && !isAdmin) {
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
