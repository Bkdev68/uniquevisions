import React from "react";
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
import { AnimatedSection } from "../AnimatedSection";
import { EditableTestimonialCard } from "./EditableTestimonialCard";
import { AddItemButton } from "./AddItemButton";
import { EditableText } from "./EditableText";
import { SortableItem } from "./SortableItem";
import { useEditContext } from "@/contexts/EditContext";
import type { Testimonial } from "@/hooks/useContent";

interface EditableTestimonialsProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
  testimonials: Testimonial[];
  onTestimonialUpdate: (testimonial: Testimonial) => void;
  onTestimonialDelete: (id: string) => void;
  onTestimonialAdd: () => void;
  onTestimonialsReorder: (testimonials: Testimonial[]) => void;
}

export const EditableTestimonials: React.FC<EditableTestimonialsProps> = ({
  content,
  onContentChange,
  testimonials,
  onTestimonialUpdate,
  onTestimonialDelete,
  onTestimonialAdd,
  onTestimonialsReorder,
}) => {
  const { isEditMode } = useEditContext();
  
  const title = content?.testimonials?.title?.de || "Kundenstimmen und Erfahrungsberichte";
  const subtitle = content?.testimonials?.subtitle?.de || "Das sagen unsere Kunden über die Zusammenarbeit.";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = testimonials.findIndex((t) => t.id === active.id);
      const newIndex = testimonials.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(testimonials, oldIndex, newIndex).map((t, i) => ({
        ...t,
        display_order: i,
      }));
      onTestimonialsReorder(reordered);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            <EditableText
              value={title}
              onChange={(value) => onContentChange("testimonials", "title", value)}
              as="span"
            />
          </h2>
          <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <EditableText
              value={subtitle}
              onChange={(value) => onContentChange("testimonials", "subtitle", value)}
              as="p"
            />
          </div>
        </AnimatedSection>

        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={testimonials.map((t) => t.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.map((testimonial) => (
                  <SortableItem key={testimonial.id} id={testimonial.id}>
                    <EditableTestimonialCard
                      testimonial={testimonial}
                      onUpdate={onTestimonialUpdate}
                      onDelete={onTestimonialDelete}
                    />
                  </SortableItem>
                ))}

                <AddItemButton onClick={onTestimonialAdd} label="Neues Testimonial" className="h-full" />
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.id} delay={index * 0.1}>
                <EditableTestimonialCard
                  testimonial={testimonial}
                  onUpdate={onTestimonialUpdate}
                  onDelete={onTestimonialDelete}
                />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EditableTestimonials;
