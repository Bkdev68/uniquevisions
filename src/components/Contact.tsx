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
      // Save to database
      const { error } = await supabase.from("contact_submissions").insert({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        package: formData.package || null,
        message: formData.message.trim(),
        gdpr_consent: formData.gdprConsent,
      });

      if (error) throw error;

      // Get notification email from settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "notification_email")
        .maybeSingle();
      
      const notificationEmail = settingsData?.value || "kontakt@uniquevisions.at";

      // Send confirmation email to user
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: formData.email.trim(),
            subject: t("Vielen Dank für Ihre Anfrage - UNIQUEVISIONS", "Thank you for your inquiry - UNIQUEVISIONS"),
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
              </head>
              <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Jost', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(184, 134, 11, 0.3);">
                            <h1 style="margin: 0; font-family: 'Urbanist', sans-serif; font-size: 28px; font-weight: 300; letter-spacing: 6px; color: #b8860b; text-transform: uppercase;">UNIQUEVISIONS</h1>
                          </td>
                        </tr>
                        <!-- Main Content -->
                        <tr>
                          <td style="padding: 40px;">
                            <h2 style="margin: 0 0 24px; font-family: 'Urbanist', sans-serif; font-size: 24px; font-weight: 400; color: #ffffff; text-align: center;">
                              ${t("Vielen Dank für Ihre Anfrage", "Thank you for your inquiry")}
                            </h2>
                            <p style="margin: 0 0 20px; font-family: 'Jost', sans-serif; font-size: 16px; line-height: 1.7; color: #a0a0a0;">
                              ${t(`Hallo ${formData.firstName.trim()},`, `Hello ${formData.firstName.trim()},`)}
                            </p>
                            <p style="margin: 0 0 30px; font-family: 'Jost', sans-serif; font-size: 16px; line-height: 1.7; color: #a0a0a0;">
                              ${t(
                                "wir haben Ihre Nachricht erhalten und freuen uns über Ihr Interesse. Wir werden uns schnellstmöglich bei Ihnen melden, um Ihr Projekt zu besprechen.",
                                "we have received your message and appreciate your interest. We will get back to you as soon as possible to discuss your project."
                              )}
                            </p>
                            <!-- Request Summary Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(184, 134, 11, 0.08); border: 1px solid rgba(184, 134, 11, 0.2); border-radius: 12px; margin-bottom: 30px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 16px; font-family: 'Urbanist', sans-serif; font-size: 14px; font-weight: 600; color: #b8860b; text-transform: uppercase; letter-spacing: 2px;">
                                    ${t("Ihre Anfrage", "Your Request")}
                                  </p>
                                  <p style="margin: 0 0 8px; font-family: 'Jost', sans-serif; font-size: 15px; color: #ffffff;">
                                    <span style="color: #707070;">${t("Name:", "Name:")}</span> ${formData.firstName.trim()} ${formData.lastName.trim()}
                                  </p>
                                  ${formData.package ? `
                                  <p style="margin: 0 0 8px; font-family: 'Jost', sans-serif; font-size: 15px; color: #ffffff;">
                                    <span style="color: #707070;">${t("Paket:", "Package:")}</span> ${formData.package.charAt(0).toUpperCase() + formData.package.slice(1)}
                                  </p>
                                  ` : ""}
                                  <p style="margin: 16px 0 8px; font-family: 'Jost', sans-serif; font-size: 15px; color: #707070;">
                                    ${t("Nachricht:", "Message:")}
                                  </p>
                                  <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 15px; line-height: 1.6; color: #d0d0d0; font-style: italic;">
                                    "${formData.message.trim().replace(/\n/g, "<br>")}"
                                  </p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 16px; line-height: 1.7; color: #a0a0a0;">
                              ${t("Mit besten Grüßen,", "Best regards,")}
                            </p>
                            <p style="margin: 8px 0 0; font-family: 'Urbanist', sans-serif; font-size: 18px; font-weight: 500; color: #b8860b;">
                              UNIQUEVISIONS
                            </p>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid #2a2a2a; text-align: center;">
                            <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 12px; color: #606060;">
                              © ${new Date().getFullYear()} UNIQUEVISIONS. ${t("Alle Rechte vorbehalten.", "All rights reserved.")}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
            text: t(
              `Vielen Dank für Ihre Anfrage!\n\nHallo ${formData.firstName.trim()},\n\nwir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.\n\nMit besten Grüßen,\nUNIQUEVISIONS`,
              `Thank you for your inquiry!\n\nHello ${formData.firstName.trim()},\n\nwe have received your message and will get back to you as soon as possible.\n\nBest regards,\nUNIQUEVISIONS`
            ),
          },
        });
      } catch (emailError) {
        console.error("Confirmation email error:", emailError);
        // Don't fail the form submission if email fails
      }

      // Send notification email to admin
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: notificationEmail,
            subject: `Neue Kontaktanfrage von ${formData.firstName.trim()} ${formData.lastName.trim()}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
              </head>
              <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Jost', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(184, 134, 11, 0.3);">
                            <h1 style="margin: 0; font-family: 'Urbanist', sans-serif; font-size: 28px; font-weight: 300; letter-spacing: 6px; color: #b8860b; text-transform: uppercase;">UNIQUEVISIONS</h1>
                            <p style="margin: 16px 0 0; font-family: 'Urbanist', sans-serif; font-size: 14px; color: #b8860b; text-transform: uppercase; letter-spacing: 3px;">Neue Kontaktanfrage</p>
                          </td>
                        </tr>
                        <!-- Main Content -->
                        <tr>
                          <td style="padding: 40px;">
                            <!-- Contact Details Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(184, 134, 11, 0.08); border: 1px solid rgba(184, 134, 11, 0.2); border-radius: 12px; margin-bottom: 24px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 16px; font-family: 'Urbanist', sans-serif; font-size: 14px; font-weight: 600; color: #b8860b; text-transform: uppercase; letter-spacing: 2px;">
                                    Kontaktdaten
                                  </p>
                                  <p style="margin: 0 0 8px; font-family: 'Jost', sans-serif; font-size: 16px; color: #ffffff;">
                                    <span style="color: #707070;">Name:</span> ${formData.firstName.trim()} ${formData.lastName.trim()}
                                  </p>
                                  <p style="margin: 0 0 8px; font-family: 'Jost', sans-serif; font-size: 16px; color: #ffffff;">
                                    <span style="color: #707070;">E-Mail:</span> <a href="mailto:${formData.email.trim()}" style="color: #b8860b; text-decoration: none;">${formData.email.trim()}</a>
                                  </p>
                                  ${formData.package ? `
                                  <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 16px; color: #ffffff;">
                                    <span style="color: #707070;">Paket:</span> ${formData.package.charAt(0).toUpperCase() + formData.package.slice(1)}
                                  </p>
                                  ` : ""}
                                </td>
                              </tr>
                            </table>
                            <!-- Message Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.03); border: 1px solid #2a2a2a; border-radius: 12px; margin-bottom: 30px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 12px; font-family: 'Urbanist', sans-serif; font-size: 14px; font-weight: 600; color: #707070; text-transform: uppercase; letter-spacing: 2px;">
                                    Nachricht
                                  </p>
                                  <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 15px; line-height: 1.7; color: #d0d0d0;">
                                    ${formData.message.trim().replace(/\n/g, "<br>")}
                                  </p>
                                </td>
                              </tr>
                            </table>
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center">
                                  <a href="${window.location.origin}/admin/contacts" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #b8860b 0%, #8b6508 100%); color: #ffffff; text-decoration: none; font-family: 'Urbanist', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 8px;">
                                    Im Admin-Bereich ansehen
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid #2a2a2a; text-align: center;">
                            <p style="margin: 0; font-family: 'Jost', sans-serif; font-size: 12px; color: #606060;">
                              Diese E-Mail wurde automatisch generiert. © ${new Date().getFullYear()} UNIQUEVISIONS
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
            text: `Neue Kontaktanfrage\n\nName: ${formData.firstName.trim()} ${formData.lastName.trim()}\nE-Mail: ${formData.email.trim()}\n${formData.package ? `Paket: ${formData.package}\n` : ""}Nachricht:\n${formData.message.trim()}`,
          },
        });
      } catch (emailError) {
        console.error("Notification email error:", emailError);
        // Don't fail the form submission if email fails
      }

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
