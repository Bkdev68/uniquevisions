import React from "react";
import { AnimatedSection } from "../AnimatedSection";
import { EditableText } from "./EditableText";
import { useEditContext } from "@/contexts/EditContext";
import { Plus, Trash2, Camera, Video, Edit, Monitor, Palette, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Camera,
  Video,
  Edit,
  Monitor,
  Clock,
};

interface ServiceItem {
  icon: string;
  text: string;
}

interface PackageItem {
  title: string;
  description: string;
  icon: string;
}

interface EditableServicesProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
  services: ServiceItem[];
  onServicesChange: (services: ServiceItem[]) => void;
  packages: PackageItem[];
  onPackagesChange: (packages: PackageItem[]) => void;
}

export const EditableServices: React.FC<EditableServicesProps> = ({
  content,
  onContentChange,
  services,
  onServicesChange,
  packages,
  onPackagesChange,
}) => {
  const { isEditMode } = useEditContext();

  const title = content?.services?.title?.de || "Dienstleistungen";
  const subtitle = content?.services?.subtitle?.de || "Je nach Projektumfang übernehme ich alle relevanten Bereiche:";
  const packagesIntro = content?.services?.packages_intro?.de || "Ich biete sowohl laufende Betreuung als auch einmalige Produktionen an:";
  const footer = content?.services?.footer?.de || "Flexibel, effizient und abgestimmt auf Ziel, Medium und Einsatzbereich.";

  const updateService = (index: number, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], text: value };
    onServicesChange(updated);
  };

  const addService = () => {
    onServicesChange([...services, { icon: "Camera", text: "Neue Dienstleistung" }]);
  };

  const removeService = (index: number) => {
    onServicesChange(services.filter((_, i) => i !== index));
  };

  const updatePackage = (index: number, field: keyof PackageItem, value: string) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    onPackagesChange(updated);
  };

  const addPackage = () => {
    onPackagesChange([...packages, { title: "Neues Paket", description: "Beschreibung", icon: "Camera" }]);
  };

  const removePackage = (index: number) => {
    onPackagesChange(packages.filter((_, i) => i !== index));
  };

  return (
    <section id="dienstleistungen" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            <EditableText
              value={title}
              onChange={(value) => onContentChange("services", "title", value)}
              as="span"
            />
          </h2>
          <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <EditableText
              value={subtitle}
              onChange={(value) => onContentChange("services", "subtitle", value)}
              as="p"
            />
          </div>
        </AnimatedSection>

        {/* Services List */}
        <AnimatedSection delay={0.1} className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Camera;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <EditableText
                      value={service.text}
                      onChange={(value) => updateService(index, value)}
                      as="span"
                      className="font-medium text-foreground"
                    />
                  </div>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeService(index)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })}

            {isEditMode && (
              <button
                onClick={addService}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Dienstleistung hinzufügen</span>
              </button>
            )}
          </div>
        </AnimatedSection>

        {/* Packages */}
        <AnimatedSection delay={0.2} className="mb-12">
          <div className="text-lg text-muted-foreground text-center mb-8">
            <EditableText
              value={packagesIntro}
              onChange={(value) => onContentChange("services", "packages_intro", value)}
              as="p"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {packages.map((pkg, index) => {
              const IconComponent = iconMap[pkg.icon] || Clock;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group relative"
                >
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePackage(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                        <EditableText
                          value={pkg.title}
                          onChange={(value) => updatePackage(index, "title", value)}
                          as="span"
                        />
                      </h3>
                      <div className="text-muted-foreground">
                        <EditableText
                          value={pkg.description}
                          onChange={(value) => updatePackage(index, "description", value)}
                          as="p"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isEditMode && (
              <button
                onClick={addPackage}
                className="p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Paket hinzufügen</span>
              </button>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="text-center">
          <div className="text-lg text-muted-foreground">
            <EditableText
              value={footer}
              onChange={(value) => onContentChange("services", "footer", value)}
              as="p"
            />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default EditableServices;
