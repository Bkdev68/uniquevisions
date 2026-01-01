import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Columns } from "lucide-react";
import { cn } from "@/lib/utils";

interface GridItemProps {
  id: string;
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3;
  onDelete: () => void;
  onCycleSpan: () => void;
  type: string;
}

export const GridItem: React.FC<GridItemProps> = ({
  id,
  children,
  colSpan = 1,
  onDelete,
  onCycleSpan,
  type,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        "border-2 border-transparent hover:border-primary/30 rounded-lg transition-all",
        isDragging && "opacity-50 z-50 border-primary",
        colSpanClass
      )}
    >
      {/* Controls */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center bg-card border border-border rounded-full shadow-lg overflow-hidden">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-muted"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          {/* Column Span Toggle (not for spacers) */}
          {type !== "spacer" && (
            <button
              onClick={onCycleSpan}
              className="p-1.5 hover:bg-muted flex items-center gap-1"
              title={`Breite: ${colSpan} Spalte(n)`}
            >
              <Columns className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground pr-1">{colSpan}</span>
            </button>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        {children}
      </div>
    </div>
  );
};

export default GridItem;
