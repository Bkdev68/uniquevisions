import React, { useState, useRef, useEffect } from "react";
import { useEditContext } from "@/contexts/EditContext";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  as: Component = "span",
  className,
  placeholder = "Text eingeben...",
  multiline = false,
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  if (isEditing) {
    const InputComponent = multiline ? "textarea" : "input";
    return (
      <InputComponent
        ref={inputRef as any}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full bg-primary/10 border-2 border-primary/40 rounded-md px-2 py-1 focus:outline-none focus:border-primary transition-colors resize-none",
          className
        )}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <Component
        className={cn(
          className,
          "group-hover:bg-primary/10 rounded px-1 -mx-1 transition-colors"
        )}
      >
        {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      </Component>
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
};

export default EditableText;
