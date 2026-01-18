import React, { useState, useCallback } from "react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUploader } from "./ImageUploader";
import type { Project, GalleryImage } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

// Sortable Gallery Item Component
interface SortableGalleryItemProps {
  id: string;
  index: number;
  image: GalleryImage;
  onUpdate: (field: keyof GalleryImage, value: string) => void;
  onRemove: () => void;
}

const SortableGalleryItem: React.FC<SortableGalleryItemProps> = ({
  id,
  index,
  image,
  onUpdate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 bg-muted/50 rounded-lg space-y-3 border-2 border-transparent",
        isDragging && "opacity-50 border-primary z-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">Bild {index + 1}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <X className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      
      <ImageUploader
        currentUrl={image.url}
        onImageChange={(url) => onUpdate("url", url)}
        folder="gallery"
        aspectRatio="16/9"
        placeholder="Galerie-Bild hochladen"
      />
      
      <Input
        value={image.caption || ""}
        onChange={(e) => onUpdate("caption", e.target.value)}
        placeholder="Bildunterschrift (optional)"
        className="text-sm"
      />
    </div>
  );
};

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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate unique IDs for gallery items
  const galleryItemIds = localProject.gallery.map((_, index) => `gallery-${index}`);

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

  const updateGalleryImage = useCallback((index: number, field: keyof GalleryImage, value: string) => {
    setLocalProject((prev) => {
      const updated = [...prev.gallery];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, gallery: updated };
    });
  }, []);

  const removeGalleryImage = useCallback((index: number) => {
    setLocalProject((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLocalProject((prev) => {
        const oldIndex = galleryItemIds.indexOf(active.id as string);
        const newIndex = galleryItemIds.indexOf(over.id as string);
        
        return {
          ...prev,
          gallery: arrayMove(prev.gallery, oldIndex, newIndex),
        };
      });
    }
  }, [galleryItemIds]);

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

            {/* Gallery Images with Drag and Drop */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  Galerie-Bilder ({localProject.gallery.length})
                  {localProject.gallery.length > 1 && (
                    <span className="text-muted-foreground ml-2 font-normal">
                      – Zum Sortieren ziehen
                    </span>
                  )}
                </label>
                <Button size="sm" variant="outline" onClick={addGalleryImage}>
                  <Plus className="w-4 h-4 mr-1" />
                  Bild hinzufügen
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {localProject.gallery.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={galleryItemIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {localProject.gallery.map((image, index) => (
                        <SortableGalleryItem
                          key={galleryItemIds[index]}
                          id={galleryItemIds[index]}
                          index={index}
                          image={image}
                          onUpdate={(field, value) => updateGalleryImage(index, field, value)}
                          onRemove={() => removeGalleryImage(index)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
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
