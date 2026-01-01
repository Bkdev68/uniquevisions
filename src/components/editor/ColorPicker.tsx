import React, { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Predefined color palette matching the design system
const colorPalette = [
  // Neutrals
  { name: "Weiß", value: "#ffffff", category: "neutral" },
  { name: "Hellgrau", value: "#f4f4f5", category: "neutral" },
  { name: "Grau", value: "#a1a1aa", category: "neutral" },
  { name: "Dunkelgrau", value: "#3f3f46", category: "neutral" },
  { name: "Fast Schwarz", value: "#18181b", category: "neutral" },
  { name: "Schwarz", value: "#09090b", category: "neutral" },
  
  // Gold / Primary
  { name: "Gold Hell", value: "#fef3c7", category: "gold" },
  { name: "Gold", value: "#d4a853", category: "gold" },
  { name: "Gold Dunkel", value: "#b8860b", category: "gold" },
  { name: "Bronze", value: "#a67c00", category: "gold" },
  
  // Accent colors
  { name: "Rot", value: "#ef4444", category: "accent" },
  { name: "Orange", value: "#f97316", category: "accent" },
  { name: "Grün", value: "#22c55e", category: "accent" },
  { name: "Blau", value: "#3b82f6", category: "accent" },
  { name: "Violett", value: "#8b5cf6", category: "accent" },
  { name: "Pink", value: "#ec4899", category: "accent" },
  
  // Transparent
  { name: "Transparent", value: "transparent", category: "special" },
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  showLabel?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = "",
  onChange,
  label = "Farbe",
  showLabel = false,
}) => {
  const [customColor, setCustomColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-muted"
          title={label}
        >
          <div className="relative">
            <Palette className="w-4 h-4" />
            {value && value !== "transparent" && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background"
                style={{ backgroundColor: value }}
              />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {showLabel && (
            <p className="text-sm font-medium text-foreground">{label}</p>
          )}
          
          {/* Neutrals */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Neutral</p>
            <div className="flex flex-wrap gap-1.5">
              {colorPalette.filter(c => c.category === "neutral").map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                    value === color.value 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Gold */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Gold / Primär</p>
            <div className="flex flex-wrap gap-1.5">
              {colorPalette.filter(c => c.category === "gold").map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                    value === color.value 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Accents */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Akzent</p>
            <div className="flex flex-wrap gap-1.5">
              {colorPalette.filter(c => c.category === "accent").map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                    value === color.value 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Eigene Farbe</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor || "#000000"}
                onChange={handleCustomColorChange}
                className="w-10 h-8 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    onChange(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 h-8 px-2 text-sm bg-background border border-border rounded"
              />
            </div>
          </div>

          {/* Transparent */}
          <button
            onClick={() => handleColorSelect("transparent")}
            className={cn(
              "w-full h-8 rounded-md border-2 text-sm transition-all",
              value === "transparent" 
                ? "border-primary bg-primary/10" 
                : "border-dashed border-border hover:border-primary/50"
            )}
          >
            Transparent / Keine
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
