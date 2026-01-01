import { AnimatedSection } from "./AnimatedSection";
import { motion } from "framer-motion";

const portfolioItems = [
  {
    title: "Landschaften",
    description: "Atemberaubende Naturaufnahmen",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    title: "Portraits",
    description: "Ausdrucksstarke Portraitfotografie",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
  },
  {
    title: "Architektur",
    description: "Moderne und klassische Bauwerke",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  },
  {
    title: "Natur",
    description: "Flora und Fauna im Detail",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
  },
  {
    title: "Urban",
    description: "Stadtleben und Streetfotografie",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
  },
  {
    title: "Events",
    description: "Besondere Momente festgehalten",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  },
];

export const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            Portfolio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Referenzen aus realen Projekten – klar, hochwertig und präzise umgesetzt.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, index) => (
            <AnimatedSection key={item.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-lg cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
