import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Compress image to reduce file size
const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

interface ImageUploaderProps {
  currentUrl: string | null;
  onImageChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onImageChange,
  bucket = "project-images",
  folder = "covers",
  className,
  aspectRatio = "4/3",
  placeholder = "Bild hochladen oder URL eingeben",
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wähle eine Bilddatei aus.",
        variant: "destructive",
      });
      return;
    }

    // Compress image if larger than 2MB for faster uploads
    let fileToUpload: File | Blob = file;
    if (file.size > 2 * 1024 * 1024) {
      try {
        fileToUpload = await compressImage(file);
      } catch (error) {
        console.error("Compression error:", error);
        // Continue with original file if compression fails
      }
    }

    setIsUploading(true);

    try {
      // Generate unique filename (use jpg for compressed images)
      const fileExt = fileToUpload === file ? file.name.split(".").pop() : "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onImageChange(urlData.publicUrl);
      
      toast({
        title: "Bild hochgeladen",
        description: "Das Bild wurde erfolgreich hochgeladen.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Beim Hochladen ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preview */}
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-muted"
        style={{ aspectRatio }}
      >
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
              onClick={handleRemoveImage}
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-xs text-center leading-tight">{placeholder}</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 h-7 text-xs px-2"
        >
          <Upload className="w-3 h-3 mr-1" />
          Hochladen
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={isUploading}
          className="h-7 w-7 p-0"
        >
          <Link className="w-3 h-3" />
        </Button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-1">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 h-7 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button size="sm" onClick={handleUrlSubmit} className="h-7 px-2">
            OK
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
