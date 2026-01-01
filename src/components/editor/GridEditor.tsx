import React, { useState, useCallback } from "react";
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
import { useEditContext } from "@/contexts/EditContext";
import { GridItem } from "./GridItem";
import { EditableText } from "./EditableText";
import { EditableImage } from "./EditableImage";
import { Plus, Trash2, Type, Image, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GridElementType = "text" | "heading" | "image" | "spacer";

export interface GridElement {
  id: string;
  type: GridElementType;
  content: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

interface GridEditorProps {
  elements: GridElement[];
  onElementsChange: (elements: GridElement[]) => void;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const GridEditor: React.FC<GridEditorProps> = ({
  elements,
  onElementsChange,
  columns = 3,
  className,
}) => {
  const { isEditMode } = useEditContext();
  const [showAddMenu, setShowAddMenu] = useState(false);

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = elements.findIndex((e) => e.id === active.id);
        const newIndex = elements.findIndex((e) => e.id === over.id);
        onElementsChange(arrayMove(elements, oldIndex, newIndex));
      }
    },
    [elements, onElementsChange]
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<GridElement>) => {
      onElementsChange(
        elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    [elements, onElementsChange]
  );

  const deleteElement = useCallback(
    (id: string) => {
      onElementsChange(elements.filter((el) => el.id !== id));
    },
    [elements, onElementsChange]
  );

  const addElement = useCallback(
    (type: GridElementType) => {
      const newElement: GridElement = {
        id: `element-${Date.now()}`,
        type,
        content: type === "heading" ? "Neue Überschrift" : type === "text" ? "Neuer Text" : "",
        colSpan: type === "heading" ? 3 : 1,
      };
      onElementsChange([...elements, newElement]);
      setShowAddMenu(false);
    },
    [elements, onElementsChange]
  );

  const cycleColSpan = useCallback(
    (id: string) => {
      const element = elements.find((e) => e.id === id);
      if (element) {
        const nextSpan = ((element.colSpan || 1) % 3) + 1 as 1 | 2 | 3;
        updateElement(id, { colSpan: nextSpan });
      }
    },
    [elements, updateElement]
  );

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const renderElement = (element: GridElement) => {
    const colSpanClass = {
      1: "",
      2: "md:col-span-2",
      3: "md:col-span-2 lg:col-span-3",
    }[element.colSpan || 1];

    switch (element.type) {
      case "heading":
        return (
          <div className={cn("py-4", colSpanClass)}>
            <EditableText
              value={element.content}
              onChange={(value) => updateElement(element.id, { content: value })}
              as="h2"
              className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold"
            />
          </div>
        );
      case "text":
        return (
          <div className={cn("py-2", colSpanClass)}>
            <EditableText
              value={element.content}
              onChange={(value) => updateElement(element.id, { content: value })}
              as="p"
              multiline
              className="text-muted-foreground"
            />
          </div>
        );
      case "image":
        return (
          <div className={cn("rounded-lg overflow-hidden", colSpanClass)}>
            <EditableImage
              src={element.content}
              alt="Grid Image"
              onChange={(url) => updateElement(element.id, { content: url })}
              aspectRatio="4/3"
            />
          </div>
        );
      case "spacer":
        return (
          <div className={cn("h-8 md:h-12", colSpanClass)} />
        );
      default:
        return null;
    }
  };

  if (!isEditMode) {
    return (
      <div className={cn(`grid ${gridColsClass} gap-6`, className)}>
        {elements.map((element) => (
          <div
            key={element.id}
            className={cn({
              "md:col-span-2": element.colSpan === 2,
              "md:col-span-2 lg:col-span-3": element.colSpan === 3,
            })}
          >
            {renderElement(element)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={elements.map((e) => e.id)}
          strategy={rectSortingStrategy}
        >
          <div className={cn(`grid ${gridColsClass} gap-4`)}>
            {elements.map((element) => (
              <GridItem
                key={element.id}
                id={element.id}
                colSpan={element.colSpan}
                onDelete={() => deleteElement(element.id)}
                onCycleSpan={() => cycleColSpan(element.id)}
                type={element.type}
              >
                {renderElement(element)}
              </GridItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Element Menu */}
      <div className="mt-4 flex justify-center">
        {showAddMenu ? (
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addElement("heading")}
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Überschrift
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addElement("text")}
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4 text-muted-foreground" />
              Text
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addElement("image")}
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Bild
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addElement("spacer")}
              className="flex items-center gap-2"
            >
              <Layout className="w-4 h-4" />
              Abstand
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddMenu(false)}
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-2 border-dashed"
          >
            <Plus className="w-4 h-4" />
            Element hinzufügen
          </Button>
        )}
      </div>
    </div>
  );
};

export default GridEditor;
