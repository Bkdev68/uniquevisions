import React, { useState } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { motion } from "framer-motion";
import { Pencil, Trash2, GripVertical, Images, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "./ImageUploader";
import type { Project, GalleryImage } from "@/hooks/useContent";

interface EditableAlbumCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const EditableAlbumCard: React.FC<EditableAlbumCardProps> = ({
  project,
  onUpdate,
  onDelete,
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  const handleSave = () => {
    onUpdate(localProject);
    setIsEditing(false);
  };

  const addGalleryImage = () => {
    setLocalProject({
      ...localProject,
      gallery: [...localProject.gallery, { url: "", caption: "" }],
    });
  };

  const updateGalleryImage = (index: number, field: keyof GalleryImage, value: string) => {
    const updated = [...localProject.gallery];
    updated[index] = { ...updated[index], [field]: value };
    setLocalProject({ ...localProject, gallery: updated });
  };

  const removeGalleryImage = (index: number) => {
    const updated = localProject.gallery.filter((_, i) => i !== index);
    setLocalProject({ ...localProject, gallery: updated });
  };

  if (!isEditMode) {
    return (
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-lg cursor-pointer"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={project.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <Images className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{project.gallery.length}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-display font-semibold text-foreground mb-1">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-lg cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={project.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
        
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <Images className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{project.gallery.length}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-display font-semibold text-foreground mb-1">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        
        {/* Edit overlay */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary">
            <Pencil className="w-4 h-4 mr-1" />
            Album bearbeiten
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Drag handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-5 h-5 text-foreground" />
        </div>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Album bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input
                  value={localProject.title}
                  onChange={(e) =>
                    setLocalProject({ ...localProject, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kunde</label>
                <Input
                  value={localProject.client || ""}
                  onChange={(e) =>
                    setLocalProject({ ...localProject, client: e.target.value })
                  }
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={localProject.description || ""}
                onChange={(e) =>
                  setLocalProject({ ...localProject, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cover-Bild</label>
              <ImageUploader
                currentUrl={localProject.image_url}
                onImageChange={(url) =>
                  setLocalProject({ ...localProject, image_url: url })
                }
                folder="covers"
                aspectRatio="16/9"
                placeholder="Cover-Bild hochladen"
              />
            </div>

            {/* Gallery Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Galerie-Bilder ({localProject.gallery.length})</label>
                <Button size="sm" variant="outline" onClick={addGalleryImage}>
                  <Plus className="w-4 h-4 mr-1" />
                  Bild hinzufügen
                </Button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {localProject.gallery.map((image, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bild {index + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeGalleryImage(index)}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <ImageUploader
                      currentUrl={image.url}
                      onImageChange={(url) => updateGalleryImage(index, "url", url)}
                      folder="gallery"
                      aspectRatio="16/9"
                      placeholder="Galerie-Bild hochladen"
                    />
                    
                    <Input
                      value={image.caption || ""}
                      onChange={(e) => updateGalleryImage(index, "caption", e.target.value)}
                      placeholder="Bildunterschrift (optional)"
                      className="text-sm"
                    />
                  </div>
                ))}
                
                {localProject.gallery.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                    <Images className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Noch keine Bilder in diesem Album
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave}>Speichern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableAlbumCard;
