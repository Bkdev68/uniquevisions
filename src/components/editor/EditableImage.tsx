import React, { useState } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { cn } from "@/lib/utils";
import { ImageIcon, Pencil, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableImageProps {
  src: string | null;
  alt: string;
  onChange: (url: string) => void;
  className?: string;
  aspectRatio?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onChange,
  className,
  aspectRatio = "4/3",
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localUrl, setLocalUrl] = useState(src || "");

  const handleSave = () => {
    onChange(localUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalUrl(src || "");
    setIsEditing(false);
  };

  if (!isEditMode) {
    return (
      <div className={cn("overflow-hidden", className)} style={{ aspectRatio }}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("overflow-hidden relative", className)} style={{ aspectRatio }}>
        {localUrl ? (
          <img src={localUrl} alt={alt} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-3">
            <Input
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="Bild-URL eingeben..."
              className="w-full"
            />
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                Speichern
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden relative group cursor-pointer", className)}
      style={{ aspectRatio }}
      onClick={() => setIsEditing(true)}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-md flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Bild ändern
        </div>
      </div>
    </div>
  );
};

export default EditableImage;
