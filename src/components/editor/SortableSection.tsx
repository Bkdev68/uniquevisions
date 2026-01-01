import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditContext } from "@/contexts/EditContext";
import { GripVertical, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableSectionProps {
  id: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}

export const SortableSection: React.FC<SortableSectionProps> = ({
  id,
  name,
  children,
  className,
}) => {
  const { isEditMode } = useEditContext();
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

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group/section",
        isDragging && "opacity-50 z-50",
        className
      )}
    >
      {/* Section label & drag handle */}
      <div className="absolute -left-4 md:left-4 top-4 z-20 flex items-center gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full cursor-grab active:cursor-grabbing shadow-lg"
        >
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-medium">{name}</span>
        </div>
      </div>

      {/* Section border indicator */}
      <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover/section:border-primary/30 pointer-events-none transition-colors rounded-lg" />

      {children}
    </div>
  );
};

export default SortableSection;
