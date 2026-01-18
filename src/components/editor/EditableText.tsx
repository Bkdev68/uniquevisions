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
  textColor?: string;
  fontFamily?: string;
  fontSize?: string; // in pt, e.g. "24"
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  as: Component = "span",
  className,
  placeholder = "Text eingeben...",
  multiline = false,
  textColor,
  fontFamily,
  fontSize,
}) => {
  const { isEditMode } = useEditContext();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Build inline style
  const textStyle: React.CSSProperties = {
    color: textColor && textColor !== "transparent" ? textColor : undefined,
    fontFamily: fontFamily || undefined,
    fontSize: fontSize ? `${fontSize}pt` : undefined,
  };

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
    return (
      <Component 
        className={className}
        style={textStyle}
      >
        {value || placeholder}
      </Component>
    );
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
        style={textStyle}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <div
      className="group relative cursor-pointer min-h-[1.5em]"
      onClick={() => setIsEditing(true)}
    >
      {value ? (
        <Component
          className={cn(
            className,
            "group-hover:bg-primary/10 rounded px-1 -mx-1 transition-colors"
          )}
          style={textStyle}
        >
          {value}
        </Component>
      ) : (
        <div 
          className={cn(
            "min-h-[2em] w-full border-2 border-dashed border-primary/30 rounded-md flex items-center justify-center text-muted-foreground italic hover:border-primary/60 hover:bg-primary/5 transition-colors py-2 px-4",
            className
          )}
          style={textStyle}
        >
          {placeholder}
        </div>
      )}
      {value && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
};

export default EditableText;