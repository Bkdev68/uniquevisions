import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Columns, Type, PaintBucket } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";

interface GridItemProps {
  id: string;
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3;
  onDelete: () => void;
  onCycleSpan: () => void;
  type: string;
  textColor?: string;
  bgColor?: string;
  onTextColorChange?: (color: string) => void;
  onBgColorChange?: (color: string) => void;
}

export const GridItem: React.FC<GridItemProps> = ({
  id,
  children,
  colSpan = 1,
  onDelete,
  onCycleSpan,
  type,
  textColor,
  bgColor,
  onTextColorChange,
  onBgColorChange,
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

  const colSpanClass = {
    1: "",
    2: "md:col-span-2",
    3: "md:col-span-2 lg:col-span-3",
  }[colSpan];

  // Determine if this element type supports color changes
  const supportsTextColor = ["heading", "subheading", "text"].includes(type);
  const supportsBgColor = !["spacer", "contact-section"].includes(type);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: bgColor && bgColor !== "transparent" ? bgColor : undefined,
      }}
      className={cn(
        "relative group",
        "border-2 border-transparent hover:border-primary/30 rounded-lg transition-all",
        isDragging && "opacity-50 z-50 border-primary",
        colSpanClass
      )}
    >
      {/* Controls */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center bg-card border border-border rounded-full shadow-lg overflow-hidden">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-muted"
            title="Verschieben"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          {/* Column Span Toggle */}
          {type !== "spacer" && type !== "contact-section" && (
            <button
              onClick={onCycleSpan}
              className="p-1.5 hover:bg-muted flex items-center gap-0.5"
              title={`Breite: ${colSpan} Spalte(n)`}
            >
              <Columns className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground pr-0.5">{colSpan}</span>
            </button>
          )}

          {/* Text Color Picker */}
          {supportsTextColor && onTextColorChange && (
            <div className="flex items-center hover:bg-muted" title="Textfarbe">
              <Type className="w-3 h-3 text-muted-foreground ml-1.5" />
              <ColorPicker
                value={textColor}
                onChange={onTextColorChange}
                label="Textfarbe"
              />
            </div>
          )}

          {/* Background Color Picker */}
          {supportsBgColor && onBgColorChange && (
            <div className="flex items-center hover:bg-muted" title="Hintergrund">
              <PaintBucket className="w-3 h-3 text-muted-foreground ml-1.5" />
              <ColorPicker
                value={bgColor}
                onChange={onBgColorChange}
                label="Hintergrund"
              />
            </div>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10"
            title="Löschen"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-2"
        style={{ color: textColor && textColor !== "transparent" ? textColor : undefined }}
      >
        {children}
      </div>
    </div>
  );
};

export default GridItem;
