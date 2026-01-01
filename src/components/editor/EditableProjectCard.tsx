import React, { useState } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { motion } from "framer-motion";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/hooks/useContent";

interface EditableProjectCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const EditableProjectCard: React.FC<EditableProjectCardProps> = ({
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
            Bearbeiten
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Projekt bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={localProject.description || ""}
                onChange={(e) =>
                  setLocalProject({ ...localProject, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bild-URL</label>
              <Input
                value={localProject.image_url || ""}
                onChange={(e) =>
                  setLocalProject({ ...localProject, image_url: e.target.value })
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
            <div>
              <label className="text-sm font-medium">Rolle</label>
              <Input
                value={localProject.role || ""}
                onChange={(e) =>
                  setLocalProject({ ...localProject, role: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
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

export default EditableProjectCard;
