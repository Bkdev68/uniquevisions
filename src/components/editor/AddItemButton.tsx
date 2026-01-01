import React from "react";
import { useEditContext } from "@/contexts/EditContext";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddItemButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({
  onClick,
  label,
  className,
}) => {
  const { isEditMode } = useEditContext();

  if (!isEditMode) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer min-h-[200px]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </button>
  );
};

export default AddItemButton;
