import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useTestimonials, useSiteContent } from "@/hooks/useContent";
import type { Project, Testimonial } from "@/hooks/useContent";
import { LanguageProvider } from "@/hooks/useLanguage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { EditProvider, useEditContext } from "@/contexts/EditContext";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { GridItem } from "@/components/editor/GridItem";
import { EditableText } from "@/components/editor/EditableText";
import { EditableImage } from "@/components/editor/EditableImage";
import { EditableImageWithUpload } from "@/components/editor/EditableImageWithUpload";
import { EditableAlbumCard } from "@/components/editor/EditableAlbumCard";
import { EditableTestimonialCard } from "@/components/editor/EditableTestimonialCard";
import { AddItemButton } from "@/components/editor/AddItemButton";
import { AlbumViewer } from "@/components/portfolio/AlbumViewer";
import { Contact } from "@/components/Contact";
import { Loader2, Plus, Type, Image, Columns, Layout, Film, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GridElementType = 
  | "heading" 
  | "subheading" 
  | "text" 
  | "image" 
  | "project" 
  | "testimonial" 
  | "spacer"
  | "service-card"
  | "feature-item"
  | "contact-section";

export interface GridElement {
  id: string;
  type: GridElementType;
  content: string;
  colSpan?: 1 | 2 | 3;
  textColor?: string;
  bgColor?: string;
  fontFamily?: string;
  fontSize?: string;
  data?: any; // For complex elements like projects/testimonials
}

// Helper to create initial grid from content
const createInitialGrid = (
  content: Record<string, Record<string, { de: string; en: string }>> | undefined,
  projects: Project[],
  testimonials: Testimonial[]
): GridElement[] => {
  // Check if we have saved grid layout
  const savedLayoutStr = content?.visual_editor?.grid_layout?.de;
  if (savedLayoutStr) {
    try {
      const savedLayout = JSON.parse(savedLayoutStr) as Array<{
        id: string;
        type: GridElementType;
        colSpan?: 1 | 2 | 3;
      }>;
      
      const elements: GridElement[] = [];
      
      for (const layoutItem of savedLayout) {
        if (layoutItem.type === "project") {
          const projectId = layoutItem.id.replace("project-", "");
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            elements.push({
              id: layoutItem.id,
              type: "project",
              content: project.title,
              colSpan: layoutItem.colSpan || 1,
              data: project,
            });
          }
        } else if (layoutItem.type === "testimonial") {
          const testimonialId = layoutItem.id.replace("testimonial-", "");
          const testimonial = testimonials.find((t) => t.id === testimonialId);
          if (testimonial) {
            elements.push({
              id: layoutItem.id,
              type: "testimonial",
              content: testimonial.quote,
              colSpan: layoutItem.colSpan || 1,
              data: testimonial,
            });
          }
        } else if (layoutItem.type === "contact-section") {
          elements.push({
            id: layoutItem.id,
            type: "contact-section",
            content: "",
            colSpan: 3,
          });
        } else if (layoutItem.type === "spacer") {
          elements.push({
            id: layoutItem.id,
            type: "spacer",
            content: "",
            colSpan: layoutItem.colSpan || 3,
          });
        } else {
          // Load content element (heading, subheading, text, image)
          const savedContentStr = content?.visual_editor?.[layoutItem.id]?.de;
          if (savedContentStr) {
            try {
              const savedContent = JSON.parse(savedContentStr);
              elements.push({
                id: layoutItem.id,
                type: savedContent.type || layoutItem.type,
                content: savedContent.content || "",
                colSpan: savedContent.colSpan || layoutItem.colSpan || 1,
                textColor: savedContent.textColor,
                bgColor: savedContent.bgColor,
                fontFamily: savedContent.fontFamily,
                fontSize: savedContent.fontSize,
              });
            } catch {
              // Fallback: use layout info only
              elements.push({
                id: layoutItem.id,
                type: layoutItem.type,
                content: "",
                colSpan: layoutItem.colSpan || 1,
              });
            }
          } else {
            elements.push({
              id: layoutItem.id,
              type: layoutItem.type,
              content: "",
              colSpan: layoutItem.colSpan || 1,
            });
          }
        }
      }
      
      if (elements.length > 0) {
        return elements;
      }
    } catch (e) {
      console.error("Failed to parse saved grid layout:", e);
    }
  }

  // Fallback: Create default grid
  const elements: GridElement[] = [];
  let order = 0;

  // Hero Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.hero?.headline?.de || "Professioneller Foto- & Video-Content mit klarer Wirkung.",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "subheading",
    content: content?.hero?.subheadline?.de || "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/Therme-Spa.jpg",
    colSpan: 1,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/HotelGastronomie.jpg",
    colSpan: 1,
  });
  elements.push({
    id: `el-${order++}`,
    type: "image",
    content: "https://uniquevisions.at/wp-content/uploads/2025/12/Events-Eleganz.jpg",
    colSpan: 1,
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // About Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.about?.title?.de || "Visuelle Inhalte mit Anspruch",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "text",
    content: content?.about?.description1?.de || "Ich realisiere hochwertige Foto- und Videoproduktionen für Marken, Unternehmen und Events.",
    colSpan: 3,
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // Portfolio Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.portfolio?.title?.de || "Portfolio",
    colSpan: 3,
  });
  elements.push({
    id: `el-${order++}`,
    type: "subheading",
    content: content?.portfolio?.subtitle?.de || "Referenzen aus realen Projekten.",
    colSpan: 3,
  });

  // Add projects
  projects.forEach((project) => {
    elements.push({
      id: `project-${project.id}`,
      type: "project",
      content: project.title,
      colSpan: 1,
      data: project,
    });
  });

  // Spacer
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });

  // Testimonials Section
  elements.push({
    id: `el-${order++}`,
    type: "heading",
    content: content?.testimonials?.title?.de || "Kundenstimmen",
    colSpan: 3,
  });

  // Add testimonials
  testimonials.forEach((testimonial) => {
    elements.push({
      id: `testimonial-${testimonial.id}`,
      type: "testimonial",
      content: testimonial.quote,
      colSpan: 1,
      data: testimonial,
    });
  });

  // Contact Section
  elements.push({ id: `el-${order++}`, type: "spacer", content: "", colSpan: 3 });
  elements.push({
    id: `contact-section`,
    type: "contact-section",
    content: "",
    colSpan: 3,
  });

  return elements;
};

const VisualEditorContent: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isEditMode, setIsSaving } = useEditContext();

  // Fetch data
  const { data: projects = [], isLoading: projectsLoading } = useProjects("de");
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials("de");
  const { data: siteContent, isLoading: contentLoading } = useSiteContent();

  // Grid elements state
  const [gridElements, setGridElements] = useState<GridElement[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Project | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Undo history
  const [history, setHistory] = useState<GridElement[][]>([]);
  const maxHistorySize = 50;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize grid from data
  useEffect(() => {
    if (!projectsLoading && !testimonialsLoading && !contentLoading) {
      setGridElements(createInitialGrid(siteContent, projects, testimonials));
    }
  }, [projects, testimonials, siteContent, projectsLoading, testimonialsLoading, contentLoading]);

  const markChanged = useCallback(() => setHasChanges(true), []);

  // Save current state to history before making changes
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(gridElements))];
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      return newHistory;
    });
  }, [gridElements, maxHistorySize]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setGridElements(previousState);
    markChanged();
    toast({ title: "Rückgängig", description: "Letzte Änderung wurde rückgängig gemacht." });
  }, [history, markChanged, toast]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      saveToHistory();
      setGridElements((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === active.id);
        const newIndex = prev.findIndex((e) => e.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      markChanged();
    }
  }, [markChanged, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<GridElement>) => {
    saveToHistory();
    setGridElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    markChanged();
  }, [markChanged, saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    saveToHistory();
    setGridElements((prev) => prev.filter((el) => el.id !== id));
    markChanged();
  }, [markChanged, saveToHistory]);

  const addElement = useCallback((type: GridElementType) => {
    saveToHistory();
    const newElement: GridElement = {
      id: `el-${Date.now()}`,
      type,
      content: type === "heading" 
        ? "Neue Überschrift" 
        : type === "subheading" 
        ? "Neue Unterüberschrift"
        : type === "text" 
        ? "Neuer Text hier..." 
        : "",
      colSpan: type === "heading" || type === "subheading" || type === "text" || type === "spacer" ? 3 : 1,
    };
    
    if (type === "project") {
      newElement.data = {
        id: `new-${Date.now()}`,
        title: "Neues Projekt",
        description: "Beschreibung...",
        gallery: [],
      } as Project;
      newElement.content = "Neues Projekt";
    }
    
    if (type === "testimonial") {
      newElement.data = {
        id: `new-${Date.now()}`,
        name: "Name",
        company: "Unternehmen",
        quote: "Zitat...",
      } as Testimonial;
      newElement.content = "Zitat...";
    }
    
    setGridElements((prev) => [...prev, newElement]);
    setShowAddMenu(false);
    markChanged();
  }, [markChanged, saveToHistory]);

  const cycleColSpan = useCallback((id: string) => {
    saveToHistory();
    setGridElements((prev) => {
      return prev.map((el) => {
        if (el.id === id) {
          const nextSpan = ((el.colSpan || 1) % 3) + 1 as 1 | 2 | 3;
          return { ...el, colSpan: nextSpan };
        }
        return el;
      });
    });
    markChanged();
  }, [markChanged, saveToHistory]);

  // Convert spacer to text element
  const convertToText = useCallback((id: string) => {
    saveToHistory();
    setGridElements((prev) => {
      return prev.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            type: "text" as GridElementType,
            content: "",
            colSpan: el.colSpan || 1,
          };
        }
        return el;
      });
    });
    markChanged();
  }, [markChanged, saveToHistory]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Extract and save projects
      const projectElements = gridElements.filter((e) => e.type === "project" && e.data);
      for (let i = 0; i < projectElements.length; i++) {
        const project = projectElements[i].data as Project;
        if (project.id.startsWith("new-")) {
          const { data } = await supabase.from("projects").insert({
            title: project.title,
            description: project.description,
            image_url: project.image_url,
            gallery: JSON.parse(JSON.stringify(project.gallery || [])),
            display_order: i,
            language: "de",
            is_published: true,
          }).select().single();
          
          // Update the element with the new ID
          if (data) {
            projectElements[i].data = { ...project, id: data.id };
            projectElements[i].id = `project-${data.id}`;
          }
        } else {
          await supabase.from("projects").update({
            title: project.title,
            description: project.description,
            image_url: project.image_url,
            gallery: JSON.parse(JSON.stringify(project.gallery || [])),
            display_order: i,
          }).eq("id", project.id);
        }
      }

      // Extract and save testimonials
      const testimonialElements = gridElements.filter((e) => e.type === "testimonial" && e.data);
      for (let i = 0; i < testimonialElements.length; i++) {
        const testimonial = testimonialElements[i].data as Testimonial;
        if (testimonial.id.startsWith("new-")) {
          const { data } = await supabase.from("testimonials").insert({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            avatar_url: testimonial.avatar_url,
            display_order: i,
            language: "de",
            is_published: true,
          }).select().single();
          
          // Update the element with the new ID
          if (data) {
            testimonialElements[i].data = { ...testimonial, id: data.id };
            testimonialElements[i].id = `testimonial-${data.id}`;
          }
        } else {
          await supabase.from("testimonials").update({
            name: testimonial.name,
            company: testimonial.company,
            quote: testimonial.quote,
            avatar_url: testimonial.avatar_url,
            display_order: i,
          }).eq("id", testimonial.id);
        }
      }

      // Save all content elements (headings, subheadings, text) with their colors
      const contentElements = gridElements.filter(
        (e) => ["heading", "subheading", "text"].includes(e.type)
      );
      
      // Save to site_content with unique keys based on element ID
      for (const el of contentElements) {
        await supabase.from("site_content").upsert({
          section: "visual_editor",
          key: el.id,
          value_de: JSON.stringify({
            content: el.content,
            type: el.type,
            colSpan: el.colSpan,
            textColor: el.textColor,
            bgColor: el.bgColor,
            fontFamily: el.fontFamily,
            fontSize: el.fontSize,
          }),
          value_en: JSON.stringify({
            content: el.content,
            type: el.type,
            colSpan: el.colSpan,
            textColor: el.textColor,
            bgColor: el.bgColor,
            fontFamily: el.fontFamily,
            fontSize: el.fontSize,
          }),
        }, { onConflict: "section,key" });
      }
      
      // Save image elements
      const imageElements = gridElements.filter((e) => e.type === "image");
      for (const el of imageElements) {
        await supabase.from("site_content").upsert({
          section: "visual_editor",
          key: el.id,
          value_de: JSON.stringify({
            content: el.content,
            type: el.type,
            colSpan: el.colSpan,
            bgColor: el.bgColor,
          }),
          value_en: JSON.stringify({
            content: el.content,
            type: el.type,
            colSpan: el.colSpan,
            bgColor: el.bgColor,
          }),
        }, { onConflict: "section,key" });
      }

      // Save grid layout (element order and spacers)
      const layoutData = gridElements.map((el) => ({
        id: el.id,
        type: el.type,
        colSpan: el.colSpan,
      }));
      
      await supabase.from("site_content").upsert({
        section: "visual_editor",
        key: "grid_layout",
        value_de: JSON.stringify(layoutData),
        value_en: JSON.stringify(layoutData),
      }, { onConflict: "section,key" });
    },
    onMutate: () => setIsSaving(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      setHasChanges(false);
      toast({ title: "Gespeichert!", description: "Änderungen wurden gespeichert." });
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen.", variant: "destructive" });
    },
    onSettled: () => setIsSaving(false),
  });

  const handleReset = useCallback(() => {
    setGridElements(createInitialGrid(siteContent, projects, testimonials));
    setHasChanges(false);
  }, [siteContent, projects, testimonials]);

  // Keyboard shortcuts: Ctrl+Z / Cmd+Z for undo, Ctrl+S / Cmd+S for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifierKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      if (modifierKey && e.key === 's') {
        e.preventDefault();
        if (hasChanges) {
          saveMutation.mutate();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, hasChanges, saveMutation]);

  const isLoading = projectsLoading || testimonialsLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

const renderElement = (element: GridElement) => {
    switch (element.type) {
      case "heading":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="h2"
            className="font-semibold text-center"
            textColor={element.textColor}
            fontFamily={element.fontFamily}
            fontSize={element.fontSize || "48"}
          />
        );
      case "subheading":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="p"
            className="text-muted-foreground text-center"
            textColor={element.textColor}
            fontFamily={element.fontFamily}
            fontSize={element.fontSize || "18"}
          />
        );
      case "text":
        return (
          <EditableText
            value={element.content}
            onChange={(value) => updateElement(element.id, { content: value })}
            as="p"
            multiline
            className="text-muted-foreground leading-relaxed"
            textColor={element.textColor}
            fontFamily={element.fontFamily}
            fontSize={element.fontSize || "16"}
          />
        );
      case "image":
        return (
          <EditableImageWithUpload
            src={element.content}
            alt="Grid Image"
            onChange={(url) => updateElement(element.id, { content: url })}
            aspectRatio="4/3"
            className="rounded-lg overflow-hidden"
          />
        );
      case "project":
        if (!element.data) return null;
        return (
          <div 
            onClick={() => !isEditMode && setSelectedAlbum(element.data)}
            className={!isEditMode ? "cursor-pointer" : ""}
          >
            <EditableAlbumCard
              project={element.data}
              onUpdate={(updated) => updateElement(element.id, { data: updated, content: updated.title })}
              onDelete={() => deleteElement(element.id)}
            />
          </div>
        );
      case "testimonial":
        if (!element.data) return null;
        return (
          <EditableTestimonialCard
            testimonial={element.data}
            onUpdate={(updated) => updateElement(element.id, { data: updated, content: updated.quote })}
            onDelete={() => deleteElement(element.id)}
          />
        );
      case "spacer":
        return (
          <div className="h-12 md:h-20 flex items-center justify-center">
            {isEditMode && (
              <button
                onClick={() => convertToText(element.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 rounded-md transition-colors"
              >
                <Type className="w-4 h-4" />
                Text hinzufügen
              </button>
            )}
          </div>
        );
      case "contact-section":
        return <Contact />;
      default:
        return null;
    }
  };

  const getColSpanClass = (colSpan?: number) => {
    switch (colSpan) {
      case 2: return "md:col-span-2";
      case 3: return "md:col-span-2 lg:col-span-3";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-logo font-semibold tracking-tight">UNIQUEVISIONS</span>
          <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            Grid Editor
          </span>
        </div>
      </header>

      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          {isEditMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={gridElements.map((e) => e.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridElements.map((element) => (
                    <GridItem
                      key={element.id}
                      id={element.id}
                      colSpan={element.colSpan}
                      onDelete={() => deleteElement(element.id)}
                      onCycleSpan={() => cycleColSpan(element.id)}
                      type={element.type}
                      textColor={element.textColor}
                      bgColor={element.bgColor}
                      fontFamily={element.fontFamily}
                      fontSize={element.fontSize}
                      onTextColorChange={(color) => updateElement(element.id, { textColor: color })}
                      onBgColorChange={(color) => updateElement(element.id, { bgColor: color })}
                      onFontChange={(font) => updateElement(element.id, { fontFamily: font })}
                      onFontSizeChange={(size) => updateElement(element.id, { fontSize: size })}
                    >
                      {renderElement(element)}
                    </GridItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridElements.map((element) => (
                <div
                  key={element.id}
                  className={cn("py-2 rounded-lg", getColSpanClass(element.colSpan))}
                  style={{
                    color: element.textColor && element.textColor !== "transparent" ? element.textColor : undefined,
                    backgroundColor: element.bgColor && element.bgColor !== "transparent" ? element.bgColor : undefined,
                  }}
                >
                  {renderElement(element)}
                </div>
              ))}
            </div>
          )}

          {/* Add Element Button */}
          {isEditMode && (
            <div className="mt-8 flex justify-center">
              {showAddMenu ? (
                <div className="flex flex-wrap items-center justify-center gap-2 bg-card border border-border rounded-lg p-3 shadow-lg">
                  <Button size="sm" variant="ghost" onClick={() => addElement("heading")} className="flex items-center gap-2">
                    <Type className="w-4 h-4" /> Überschrift
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("subheading")} className="flex items-center gap-2">
                    <Type className="w-4 h-4 opacity-60" /> Unterüberschrift
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("text")} className="flex items-center gap-2">
                    <Columns className="w-4 h-4" /> Text
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("image")} className="flex items-center gap-2">
                    <Image className="w-4 h-4" /> Bild
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("project")} className="flex items-center gap-2">
                    <Film className="w-4 h-4" /> Projekt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("testimonial")} className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Testimonial
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => addElement("spacer")} className="flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Abstand
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddMenu(false)}>✕</Button>
                </div>
              ) : (
                <Button variant="outline" size="lg" onClick={() => setShowAddMenu(true)} className="flex items-center gap-2 border-dashed">
                  <Plus className="w-5 h-5" /> Element hinzufügen
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <EditorToolbar
        onSave={() => saveMutation.mutate()}
        onReset={handleReset}
        onUndo={handleUndo}
        hasChanges={hasChanges}
        canUndo={history.length > 0}
      />

      {/* Album Viewer */}
      {selectedAlbum && !isEditMode && (
        <AlbumViewer
          isOpen={!!selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          title={selectedAlbum.title}
          images={selectedAlbum.gallery}
        />
      )}
    </div>
  );
};

const VisualEditor: React.FC = () => {
  return (
    <LanguageProvider>
      <EditProvider>
        <VisualEditorContent />
      </EditProvider>
    </LanguageProvider>
  );
};

export default VisualEditor;
