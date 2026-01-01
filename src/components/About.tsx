import { AnimatedSection } from "./AnimatedSection";
import { Check } from "lucide-react";

const features = [
  "Hochwertige Bildsprache & Umsetzung",
  "Flexible Zusammenarbeit",
  "Klare Planung & Kommunikation",
  "Präzise Postproduktion",
];

export const About = () => {
  return (
    <section id="ueber-mich" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-6">
              Visuelle Inhalte mit Anspruch
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="mb-10">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Ich realisiere hochwertige Foto- und Videoproduktionen für Marken, Unternehmen und Events – klar geplant, qualitativ umgesetzt und flexibel an Ihre Ziele angepasst.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Meine Arbeitsweise ist strukturiert und effizient – vom ersten Konzept bis zur finalen Ausspielung.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-foreground"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="text-center">
            <p className="text-xl md:text-2xl font-display text-gradient-gold">
              Inhalte, die wirken – und nachhaltig überzeugen.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default About;
