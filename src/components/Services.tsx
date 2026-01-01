import { AnimatedSection } from "./AnimatedSection";
import { Camera, Video, Edit, Monitor, Palette, Clock } from "lucide-react";

const servicesList = [
  { icon: Palette, text: "Konzeption & visuelle Planung" },
  { icon: Camera, text: "Foto- & Videoproduktion" },
  { icon: Video, text: "Behind-the-Scenes & Detailaufnahmen" },
  { icon: Edit, text: "Bild- & Videobearbeitung" },
  { icon: Monitor, text: "Optimierung für Website & Social Media" },
];

const packages = [
  {
    title: "3-, 6- oder 12-Monats-Pakete",
    description: "Für Marken und Unternehmen, mit regelmäßigem Content-Bedarf.",
    icon: Clock,
  },
  {
    title: "Individuelle Projekte",
    description: "Für einzelne Produktionen, Events oder besondere Anforderungen.",
    icon: Camera,
  },
];

export const Services = () => {
  return (
    <section id="dienstleistungen" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            Dienstleistungen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Je nach Projektumfang übernehme ich alle relevanten Bereiche:
          </p>
        </AnimatedSection>

        {/* Services List */}
        <AnimatedSection delay={0.1} className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{service.text}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Packages */}
        <AnimatedSection delay={0.2} className="mb-12">
          <p className="text-lg text-muted-foreground text-center mb-8">
            Ich biete sowohl <strong className="text-foreground">laufende Betreuung</strong> als auch{" "}
            <strong className="text-foreground">einmalige Produktionen</strong> an:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <pkg.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-muted-foreground">{pkg.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="text-center">
          <p className="text-lg text-muted-foreground">
            Flexibel, effizient und abgestimmt auf Ziel, Medium und Einsatzbereich.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Services;
