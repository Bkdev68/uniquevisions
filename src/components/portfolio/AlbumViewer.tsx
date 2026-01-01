import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface AlbumViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: GalleryImage[];
}

export const AlbumViewer: React.FC<AlbumViewerProps> = ({
  isOpen,
  onClose,
  title,
  images,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openImage = (index: number) => {
    setCurrentIndex(index);
    setViewMode("single");
  };

  if (images.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogTitle>{title}</DialogTitle>
          <div className="py-12 text-center text-muted-foreground">
            Keine Bilder in diesem Album vorhanden.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            {viewMode === "single" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück zur Übersicht
              </Button>
            )}
            <h2 className="text-xl font-display font-semibold">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "single" && (
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {images.length}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group relative"
                  onClick={() => openImage(index)}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Bild ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
                      <p className="text-sm text-foreground">{image.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="relative flex items-center justify-center min-h-[60vh] bg-background">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center p-4"
                >
                  <img
                    src={images[currentIndex].url}
                    alt={images[currentIndex].caption || `Bild ${currentIndex + 1}`}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg"
                  />
                  {images[currentIndex].caption && (
                    <p className="mt-4 text-center text-muted-foreground">
                      {images[currentIndex].caption}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={goPrev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={goNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlbumViewer;
