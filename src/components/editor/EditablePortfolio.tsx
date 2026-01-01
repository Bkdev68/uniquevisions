import React, { useState } from "react";
import { AnimatedSection } from "../AnimatedSection";
import { EditableAlbumCard } from "./EditableAlbumCard";
import { AddItemButton } from "./AddItemButton";
import { EditableText } from "./EditableText";
import { AlbumViewer } from "../portfolio/AlbumViewer";
import { useEditContext } from "@/contexts/EditContext";
import type { Project } from "@/hooks/useContent";

interface EditablePortfolioProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
  projects: Project[];
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (id: string) => void;
  onProjectAdd: () => void;
}

export const EditablePortfolio: React.FC<EditablePortfolioProps> = ({
  content,
  onContentChange,
  projects,
  onProjectUpdate,
  onProjectDelete,
  onProjectAdd,
}) => {
  const { isEditMode } = useEditContext();
  const [selectedAlbum, setSelectedAlbum] = useState<Project | null>(null);

  const title = content?.portfolio?.title?.de || "Portfolio";
  const subtitle = content?.portfolio?.subtitle?.de || "Referenzen aus realen Projekten – klar, hochwertig und präzise umgesetzt.";

  return (
    <>
      <section id="portfolio" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
              <EditableText
                value={title}
                onChange={(value) => onContentChange("portfolio", "title", value)}
                as="span"
              />
            </h2>
            <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <EditableText
                value={subtitle}
                onChange={(value) => onContentChange("portfolio", "subtitle", value)}
                as="p"
              />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <AnimatedSection key={project.id} delay={index * 0.1}>
                <div onClick={() => !isEditMode && setSelectedAlbum(project)}>
                  <EditableAlbumCard
                    project={project}
                    onUpdate={onProjectUpdate}
                    onDelete={onProjectDelete}
                  />
                </div>
              </AnimatedSection>
            ))}
            
            <AnimatedSection delay={projects.length * 0.1}>
              <AddItemButton onClick={onProjectAdd} label="Neues Album" />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Album Viewer for preview mode */}
      {selectedAlbum && !isEditMode && (
        <AlbumViewer
          isOpen={!!selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          title={selectedAlbum.title}
          images={selectedAlbum.gallery}
        />
      )}
    </>
  );
};

export default EditablePortfolio;
