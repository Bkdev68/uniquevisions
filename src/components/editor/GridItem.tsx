import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Columns, Type, PaintBucket, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Extended font list - 60+ fonts including system fonts
const FONT_OPTIONS = [
  // Modern Sans-Serif
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Urbanist', sans-serif", label: "Urbanist" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Oswald', sans-serif", label: "Oswald" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Rubik', sans-serif", label: "Rubik" },
  { value: "'Work Sans', sans-serif", label: "Work Sans" },
  { value: "'Quicksand', sans-serif", label: "Quicksand" },
  { value: "'Barlow', sans-serif", label: "Barlow" },
  { value: "'Mulish', sans-serif", label: "Mulish" },
  { value: "'Archivo', sans-serif", label: "Archivo" },
  { value: "'Karla', sans-serif", label: "Karla" },
  { value: "'Josefin Sans', sans-serif", label: "Josefin Sans" },
  { value: "'Cabin', sans-serif", label: "Cabin" },
  { value: "'Fira Sans', sans-serif", label: "Fira Sans" },
  { value: "'PT Sans', sans-serif", label: "PT Sans" },
  { value: "'Noto Sans', sans-serif", label: "Noto Sans" },
  { value: "'Source Sans 3', sans-serif", label: "Source Sans" },
  { value: "'Libre Franklin', sans-serif", label: "Libre Franklin" },
  { value: "'Varela Round', sans-serif", label: "Varela Round" },
  { value: "'Catamaran', sans-serif", label: "Catamaran" },
  { value: "'Exo 2', sans-serif", label: "Exo 2" },
  { value: "'Fredoka', sans-serif", label: "Fredoka" },
  { value: "'Comfortaa', sans-serif", label: "Comfortaa" },
  { value: "'Overpass', sans-serif", label: "Overpass" },
  { value: "'Asap', sans-serif", label: "Asap" },
  { value: "'IBM Plex Sans', sans-serif", label: "IBM Plex Sans" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'Manrope', sans-serif", label: "Manrope" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Sora', sans-serif", label: "Sora" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  
  // Serif
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Libre Baskerville', serif", label: "Libre Baskerville" },
  { value: "'Crimson Text', serif", label: "Crimson Text" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond" },
  { value: "'PT Serif', serif", label: "PT Serif" },
  { value: "'Noto Serif', serif", label: "Noto Serif" },
  { value: "'Bitter', serif", label: "Bitter" },
  { value: "'Arvo', serif", label: "Arvo" },
  { value: "'IBM Plex Serif', serif", label: "IBM Plex Serif" },
  { value: "'DM Serif Display', serif", label: "DM Serif Display" },
  
  // Display / Decorative
  { value: "'Teko', sans-serif", label: "Teko" },
  { value: "'Bebas Neue', sans-serif", label: "Bebas Neue" },
  { value: "'Anton', sans-serif", label: "Anton" },
  { value: "'Abril Fatface', serif", label: "Abril Fatface" },
  { value: "'Righteous', sans-serif", label: "Righteous" },
  { value: "'Alfa Slab One', serif", label: "Alfa Slab One" },
  { value: "'Permanent Marker', cursive", label: "Permanent Marker" },
  { value: "'Bangers', cursive", label: "Bangers" },
  
  // Script / Handwriting
  { value: "'Pacifico', cursive", label: "Pacifico" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
  { value: "'Satisfy', cursive", label: "Satisfy" },
  { value: "'Great Vibes', cursive", label: "Great Vibes" },
  { value: "'Sacramento', cursive", label: "Sacramento" },
  { value: "'Lobster', cursive", label: "Lobster" },
  
  // System Fonts
  { value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", label: "System UI" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
  { value: "'Lucida Sans', sans-serif", label: "Lucida Sans" },
  { value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", label: "Palatino" },
  { value: "'Garamond', 'Times New Roman', serif", label: "Garamond" },
  { value: "'Century Gothic', sans-serif", label: "Century Gothic" },
  { value: "'Franklin Gothic Medium', sans-serif", label: "Franklin Gothic" },
  { value: "'Segoe UI', Tahoma, sans-serif", label: "Segoe UI" },
  { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
  { value: "'Gill Sans', sans-serif", label: "Gill Sans" },
  { value: "'Optima', sans-serif", label: "Optima" },
  { value: "'Futura', sans-serif", label: "Futura" },
  { value: "'Avenir', sans-serif", label: "Avenir" },
  { value: "'Baskerville', serif", label: "Baskerville" },
  { value: "'Didot', serif", label: "Didot" },
  { value: "'Bodoni MT', serif", label: "Bodoni" },
  { value: "'Rockwell', serif", label: "Rockwell" },
  { value: "'Copperplate', serif", label: "Copperplate" },
  { value: "'Impact', sans-serif", label: "Impact" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
  { value: "'Brush Script MT', cursive", label: "Brush Script" },
];

interface GridItemProps {
  id: string;
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3;
  onDelete: () => void;
  onCycleSpan: () => void;
  type: string;
  textColor?: string;
  bgColor?: string;
  fontFamily?: string;
  fontSize?: string;
  onTextColorChange?: (color: string) => void;
  onBgColorChange?: (color: string) => void;
  onFontChange?: (font: string) => void;
  onFontSizeChange?: (size: string) => void;
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
  fontFamily,
  fontSize,
  onTextColorChange,
  onBgColorChange,
  onFontChange,
  onFontSizeChange,
}) => {
  const [fontSearch, setFontSearch] = useState("");
  const [fontPickerOpen, setFontPickerOpen] = useState(false);

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

  // Filter fonts based on search
  const filteredFonts = FONT_OPTIONS.filter((font) =>
    font.label.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // Get current font label
  const currentFontLabel = FONT_OPTIONS.find((f) => f.value === fontFamily)?.label || "Urbanist";

  // Parse fontSize (stored as "16" for 16pt)
  const currentFontSize = fontSize ? parseInt(fontSize) : 16;

  const handleFontSizeChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 200) {
      onFontSizeChange?.(value);
    }
  };

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

          {/* Font Picker */}
          {supportsTextColor && onFontChange && (
            <Popover open={fontPickerOpen} onOpenChange={setFontPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  className="px-2 py-1.5 hover:bg-muted text-xs flex items-center gap-1 max-w-24 truncate"
                  title="Schriftart"
                >
                  <Type className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{currentFontLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="center">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Schriftart suchen..."
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-0.5">
                      {filteredFonts.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => {
                            onFontChange(font.value);
                            setFontPickerOpen(false);
                            setFontSearch("");
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
                            fontFamily === font.value && "bg-primary/10 text-primary"
                          )}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </button>
                      ))}
                      {filteredFonts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Keine Schriftart gefunden
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Font Size Input (pt) */}
          {supportsTextColor && onFontSizeChange && (
            <div className="flex items-center hover:bg-muted px-1" title="Schriftgröße (pt)">
              <Input
                type="number"
                min="8"
                max="200"
                value={currentFontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-12 h-6 text-xs text-center border-0 bg-transparent p-0"
              />
              <span className="text-xs text-muted-foreground mr-1">pt</span>
            </div>
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