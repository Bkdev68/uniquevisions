import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const serviceCategories = [
  {
    title: "THERME & SPA",
    image: "https://uniquevisions.at/wp-content/uploads/2025/12/Therme-Spa.jpg",
  },
  {
    title: "HOTEL & GASTRONOMIE",
    image: "https://uniquevisions.at/wp-content/uploads/2025/12/HotelGastronomie.jpg",
  },
  {
    title: "EVENTS & ELEGANZ",
    image: "https://uniquevisions.at/wp-content/uploads/2025/12/Events-Eleganz.jpg",
  },
];

export const Hero = () => {
  const scrollToServices = () => {
    const element = document.querySelector("#dienstleistungen");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-16 relative z-10">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6">
            Professioneller Foto- & Video-
            <br />
            <span className="text-gradient-gold">Content mit klarer Wirkung.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.
          </p>
        </motion.div>

        {/* Service Category Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-12"
        >
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-lg md:text-xl font-display font-semibold text-foreground tracking-wider text-center px-4">
                  {category.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={scrollToServices}
            size="lg"
            className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border backdrop-blur-sm px-8 py-6 text-base font-medium rounded-md transition-all"
          >
            Alle Dienstleistungen entdecken
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
