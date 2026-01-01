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
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const packageOptions = [
  { value: "gold", label: "Gold" },
  { value: "platin", label: "Platin" },
  { value: "diamond", label: "Diamond" },
  { value: "individuell", label: "Individuell" },
];

export const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
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
        title: t("DSGVO-Zustimmung erforderlich", "GDPR Consent Required"),
        description: t(
          "Bitte stimmen Sie der Datenschutzerklärung zu.",
          "Please agree to the privacy policy."
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        package: formData.package || null,
        message: formData.message.trim(),
        gdpr_consent: formData.gdprConsent,
      });

      if (error) throw error;

      toast({
        title: t("Nachricht gesendet!", "Message Sent!"),
        description: t(
          "Vielen Dank für Ihre Anfrage. Ich melde mich zeitnah bei Ihnen.",
          "Thank you for your inquiry. I will get back to you soon."
        ),
      });
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        package: "",
        message: "",
        gdprConsent: false,
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: t("Fehler", "Error"),
        description: t(
          "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
          "An error occurred while sending. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            {t("Kontaktanfrage", "Contact Request")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Teilen Sie Ihre Anforderungen – anschließend besprechen wir den optimalen Rahmen für Ihr Projekt.",
              "Share your requirements – then we will discuss the optimal framework for your project."
            )}
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
                  {t("Vorname", "First Name")}
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  maxLength={100}
                  placeholder={t("Ihr Vorname", "Your first name")}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Nachname", "Last Name")}
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  maxLength={100}
                  placeholder={t("Ihr Nachname", "Your last name")}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("E-Mail Adresse", "Email Address")}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                maxLength={255}
                placeholder="ihre@email.at"
                className="bg-background"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("Paket auswählen", "Select Package")}
              </label>
              <Select
                value={formData.package}
                onValueChange={(value) =>
                  setFormData({ ...formData, package: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t("Paket auswählen", "Select package")} />
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
                {t("Ihre Nachricht", "Your Message")}
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                maxLength={2000}
                placeholder={t("Beschreiben Sie Ihr Projekt...", "Describe your project...")}
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
                  {t(
                    "Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Daten zu.",
                    "I have read the privacy policy and agree to the processing of my data."
                  )}
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
                  {t("Wird gesendet...", "Sending...")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("Absenden!", "Submit!")}
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
