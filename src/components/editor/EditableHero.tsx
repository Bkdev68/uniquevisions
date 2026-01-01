import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EditableText } from "./EditableText";
import { EditableImage } from "./EditableImage";
import { useEditContext } from "@/contexts/EditContext";
import { useSiteContent } from "@/hooks/useContent";
import { Plus, Trash2 } from "lucide-react";

interface ServiceCategory {
  title: string;
  image: string;
}

interface EditableHeroProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
  serviceCategories: ServiceCategory[];
  onServiceCategoriesChange: (categories: ServiceCategory[]) => void;
}

export const EditableHero: React.FC<EditableHeroProps> = ({
  content,
  onContentChange,
  serviceCategories,
  onServiceCategoriesChange,
}) => {
  const { isEditMode } = useEditContext();

  const headline = content?.hero?.headline?.de || "Professioneller Foto- & Video-Content mit klarer Wirkung.";
  const subheadline = content?.hero?.subheadline?.de || "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.";
  const ctaText = content?.hero?.cta_text?.de || "Alle Dienstleistungen entdecken";

  const updateCategory = (index: number, field: keyof ServiceCategory, value: string) => {
    const updated = [...serviceCategories];
    updated[index] = { ...updated[index], [field]: value };
    onServiceCategoriesChange(updated);
  };

  const addCategory = () => {
    onServiceCategoriesChange([
      ...serviceCategories,
      { title: "Neue Kategorie", image: "" },
    ]);
  };

  const removeCategory = (index: number) => {
    const updated = serviceCategories.filter((_, i) => i !== index);
    onServiceCategoriesChange(updated);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6">
            <EditableText
              value={headline}
              onChange={(value) => onContentChange("hero", "headline", value)}
              as="span"
              multiline
            />
          </h1>
          <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            <EditableText
              value={subheadline}
              onChange={(value) => onContentChange("hero", "subheadline", value)}
              as="p"
            />
          </div>
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
              key={index}
              className="group relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <EditableImage
                src={category.image}
                alt={category.title}
                onChange={(url) => updateCategory(index, "image", url)}
                className="absolute inset-0 w-full h-full"
                aspectRatio="4/3"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
              
              {isEditMode && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeCategory(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <EditableText
                  value={category.title}
                  onChange={(value) => updateCategory(index, "title", value)}
                  as="h3"
                  className="text-lg font-display font-semibold text-foreground"
                />
              </div>
            </motion.div>
          ))}

          {isEditMode && (
            <button
              onClick={addCategory}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer aspect-[4/3]"
            >
              <Plus className="w-8 h-8 text-primary" />
              <span className="text-sm text-muted-foreground">Kategorie hinzufügen</span>
            </button>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border backdrop-blur-sm px-8 py-6 text-base font-medium rounded-md transition-all"
          >
            <EditableText
              value={ctaText}
              onChange={(value) => onContentChange("hero", "cta_text", value)}
              as="span"
            />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default EditableHero;
