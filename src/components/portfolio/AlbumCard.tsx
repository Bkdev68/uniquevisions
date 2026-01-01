import React from "react";
import { motion } from "framer-motion";
import { Images } from "lucide-react";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface AlbumCardProps {
  title: string;
  description?: string | null;
  coverImage: string | null;
  imageCount: number;
  onClick: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  title,
  description,
  coverImage,
  imageCount,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={coverImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      {/* Image count badge */}
      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
        <Images className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{imageCount}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-display font-semibold text-foreground mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AlbumCard;
