import { useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { useProjects, type GalleryImage, type Project } from "@/hooks/useContent";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard } from "./portfolio/AlbumCard";
import { AlbumViewer } from "./portfolio/AlbumViewer";

export const Portfolio = () => {
  const { language } = useLanguage();
  const { data: projects, isLoading } = useProjects(language);
  const [selectedAlbum, setSelectedAlbum] = useState<Project | null>(null);

  return (
    <>
      <section id="portfolio" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
              Portfolio
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Referenzen aus realen Projekten – klar, hochwertig und präzise umgesetzt.
            </p>
          </AnimatedSection>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(projects || []).map((project, index) => (
                <AnimatedSection key={project.id} delay={index * 0.1}>
                  <AlbumCard
                    title={project.title}
                    description={project.description}
                    coverImage={project.image_url}
                    imageCount={project.gallery.length}
                    onClick={() => setSelectedAlbum(project)}
                  />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Album Viewer Modal */}
      {selectedAlbum && (
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

export default Portfolio;
