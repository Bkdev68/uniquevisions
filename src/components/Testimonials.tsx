import { AnimatedSection } from "./AnimatedSection";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Die Zusammenarbeit war professionell und die Ergebnisse haben unsere Erwartungen übertroffen. Absolute Empfehlung!",
    name: "Maria S.",
    company: "Hotel & Spa Resort",
  },
  {
    quote: "Kreativ, zuverlässig und mit einem Auge fürs Detail. Unsere Event-Dokumentation war ein voller Erfolg.",
    name: "Thomas K.",
    company: "Event Agentur",
  },
  {
    quote: "Von der ersten Idee bis zum fertigen Video – alles aus einer Hand und in höchster Qualität.",
    name: "Sarah M.",
    company: "Marketing Director",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            Kundenstimmen und Erfahrungsberichte
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our clients' testimonials speak volumes about our services and commitment.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="h-full p-6 md:p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <Quote className="w-10 h-10 text-primary/40 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
