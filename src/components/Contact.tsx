import { useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

const packageOptions = [
  { value: "gold", label: "Gold" },
  { value: "platin", label: "Platin" },
  { value: "diamond", label: "Diamond" },
  { value: "individuell", label: "Individuell" },
];

export const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    package: "",
    message: "",
    gdprConsent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gdprConsent) {
      toast({
        title: "DSGVO-Zustimmung erforderlich",
        description: "Bitte stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Nachricht gesendet!",
      description: "Vielen Dank für Ihre Anfrage. Ich melde mich zeitnah bei Ihnen.",
    });
    
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      package: "",
      message: "",
      gdprConsent: false,
    });
    setIsSubmitting(false);
  };

  return (
    <section id="kontakt" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            Kontaktanfrage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teilen Sie Ihre Anforderungen – anschließend besprechen wir den optimalen Rahmen für Ihr Projekt.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-card p-6 md:p-10 rounded-2xl border border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vorname
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  placeholder="Ihr Vorname"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nachname
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  placeholder="Ihr Nachname"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                E-Mail Adresse
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="ihre@email.at"
                className="bg-background"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Paket auswählen
              </label>
              <Select
                value={formData.package}
                onValueChange={(value) =>
                  setFormData({ ...formData, package: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Paket auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {packageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Ihre Nachricht
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                placeholder="Beschreiben Sie Ihr Projekt..."
                rows={5}
                className="bg-background resize-none"
              />
            </div>

            <div className="mb-8">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr"
                  checked={formData.gdprConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, gdprConsent: checked as boolean })
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="gdpr"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Ich habe die{" "}
                  <a href="#" className="text-primary hover:underline">
                    Datenschutzerklärung
                  </a>{" "}
                  gelesen und stimme der Verarbeitung meiner Daten zu.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Absenden!
                </>
              )}
            </Button>
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Contact;
