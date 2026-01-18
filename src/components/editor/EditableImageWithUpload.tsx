import React, { useState } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { cn } from "@/lib/utils";
import { ImageIcon, Pencil } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface EditableImageWithUploadProps {
  src: string | null;
  alt: string;
  onChange: (url: string) => void;
  className?: string;
  aspectRatio?: string;
}

export const EditableImageWithUpload: React.FC<EditableImageWithUploadProps> = ({
  src,
  alt,
  onChange,
  className,
  aspectRatio = "4/3",
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);

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
      <div className={cn("relative", className)}>
        <ImageUploader
          currentUrl={src}
          onImageChange={(url) => {
            onChange(url);
            if (url) {
              setIsEditing(false);
            }
          }}
          folder="grid-images"
          aspectRatio={aspectRatio}
          placeholder="Bild hochladen oder URL eingeben"
        />
        <button
          onClick={() => setIsEditing(false)}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </button>
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

export default EditableImageWithUpload;
