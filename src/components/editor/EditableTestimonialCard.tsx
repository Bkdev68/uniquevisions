import React, { useState } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { Pencil, Trash2, Quote, User } from "lucide-react";
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
import type { Testimonial } from "@/hooks/useContent";

interface EditableTestimonialCardProps {
  testimonial: Testimonial;
  onUpdate: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
}

export const EditableTestimonialCard: React.FC<EditableTestimonialCardProps> = ({
  testimonial,
  onUpdate,
  onDelete,
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localTestimonial, setLocalTestimonial] = useState(testimonial);

  // Sync local state when testimonial prop changes
  React.useEffect(() => {
    setLocalTestimonial(testimonial);
  }, [testimonial]);

  const handleSave = () => {
    onUpdate(localTestimonial);
    setIsEditing(false);
  };

  const renderAvatar = () => {
    if (testimonial.avatar_url) {
      return (
        <img
          src={testimonial.avatar_url}
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
    );
  };

  if (!isEditMode) {
    return (
      <div className="h-full p-6 md:p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
        <Quote className="w-10 h-10 text-primary/40 mb-4" />
        <p className="text-foreground mb-6 leading-relaxed">
          "{testimonial.quote}"
        </p>
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            {testimonial.company && (
              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="group h-full p-6 md:p-8 rounded-xl bg-card border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors cursor-pointer relative"
        onClick={() => setIsEditing(true)}
      >
        <Quote className="w-10 h-10 text-primary/40 mb-4" />
        <p className="text-foreground mb-6 leading-relaxed">
          "{testimonial.quote}"
        </p>
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            {testimonial.company && (
              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
            )}
          </div>
        </div>

        {/* Edit overlay */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
          <Button size="sm" variant="secondary">
            <Pencil className="w-4 h-4 mr-1" />
            Bearbeiten
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(testimonial.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Testimonial bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Profilbild</label>
              <ImageUploader
                currentUrl={localTestimonial.avatar_url || null}
                onImageChange={(url) =>
                  setLocalTestimonial({ ...localTestimonial, avatar_url: url || null })
                }
                folder="avatars"
                aspectRatio="1/1"
                placeholder="Profilbild hochladen"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={localTestimonial.name}
                onChange={(e) =>
                  setLocalTestimonial({ ...localTestimonial, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unternehmen</label>
              <Input
                value={localTestimonial.company || ""}
                onChange={(e) =>
                  setLocalTestimonial({ ...localTestimonial, company: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Zitat</label>
              <Textarea
                value={localTestimonial.quote}
                onChange={(e) =>
                  setLocalTestimonial({ ...localTestimonial, quote: e.target.value })
                }
                rows={4}
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

export default EditableTestimonialCard;
