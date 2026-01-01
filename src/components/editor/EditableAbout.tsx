import React from "react";
import { AnimatedSection } from "../AnimatedSection";
import { EditableText } from "./EditableText";
import { useEditContext } from "@/contexts/EditContext";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditableAboutProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
  features: string[];
  onFeaturesChange: (features: string[]) => void;
}

export const EditableAbout: React.FC<EditableAboutProps> = ({
  content,
  onContentChange,
  features,
  onFeaturesChange,
}) => {
  const { isEditMode } = useEditContext();

  const title = content?.about?.title?.de || "Visuelle Inhalte mit Anspruch";
  const description1 = content?.about?.description1?.de || "Ich realisiere hochwertige Foto- und Videoproduktionen für Marken, Unternehmen und Events – klar geplant, qualitativ umgesetzt und flexibel an Ihre Ziele angepasst.";
  const description2 = content?.about?.description2?.de || "Meine Arbeitsweise ist strukturiert und effizient – vom ersten Konzept bis zur finalen Ausspielung.";
  const tagline = content?.about?.tagline?.de || "Inhalte, die wirken – und nachhaltig überzeugen.";

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    onFeaturesChange(updated);
  };

  const addFeature = () => {
    onFeaturesChange([...features, "Neues Feature"]);
  };

  const removeFeature = (index: number) => {
    onFeaturesChange(features.filter((_, i) => i !== index));
  };

  return (
    <section id="ueber-mich" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-6">
              <EditableText
                value={title}
                onChange={(value) => onContentChange("about", "title", value)}
                as="span"
              />
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="mb-10">
            <div className="text-lg text-muted-foreground leading-relaxed mb-6">
              <EditableText
                value={description1}
                onChange={(value) => onContentChange("about", "description1", value)}
                as="p"
                multiline
              />
            </div>
            <div className="text-lg text-muted-foreground leading-relaxed">
              <EditableText
                value={description2}
                onChange={(value) => onContentChange("about", "description2", value)}
                as="p"
                multiline
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-foreground group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <EditableText
                      value={feature}
                      onChange={(value) => updateFeature(index, value)}
                      as="span"
                      className="font-medium"
                    />
                  </div>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              
              {isEditMode && (
                <button
                  onClick={addFeature}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">Feature hinzufügen</span>
                </button>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="text-center">
            <p className="text-xl md:text-2xl font-display text-gradient-gold">
              <EditableText
                value={tagline}
                onChange={(value) => onContentChange("about", "tagline", value)}
                as="span"
              />
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default EditableAbout;
