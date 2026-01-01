import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  quote: string;
  language: string;
  display_order: number | null;
  is_published: boolean | null;
}

const emptyTestimonial: Partial<Testimonial> = {
  name: "",
  company: "",
  quote: "",
  language: "de",
  display_order: 0,
  is_published: true,
};

const TestimonialsAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<Testimonial>) => {
      if (item.id) {
        const { error } = await supabase
          .from("testimonials")
          .update(item)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert([item as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Testimonial gespeichert" });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({ title: "Testimonial gelöscht" });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openNewDialog = () => {
    setEditingItem({ ...emptyTestimonial });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Testimonial) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem?.name || !editingItem?.quote) {
      toast({
        title: "Fehler",
        description: "Name und Zitat sind erforderlich",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(editingItem);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? "Testimonial bearbeiten" : "Neues Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editingItem?.name || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unternehmen</Label>
                  <Input
                    value={editingItem?.company || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Zitat *</Label>
                <Textarea
                  value={editingItem?.quote || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sprache</Label>
                  <Select
                    value={editingItem?.language || "de"}
                    onValueChange={(value) =>
                      setEditingItem((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reihenfolge</Label>
                  <Input
                    type="number"
                    value={editingItem?.display_order || 0}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem?.is_published ?? true}
                  onCheckedChange={(checked) =>
                    setEditingItem((prev) => ({ ...prev, is_published: checked }))
                  }
                />
                <Label>Veröffentlicht</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Name</th>
              <th className="text-left p-4 text-sm font-medium">Unternehmen</th>
              <th className="text-left p-4 text-sm font-medium">Sprache</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-right p-4 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {testimonials?.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-muted-foreground">{item.company || "-"}</td>
                <td className="p-4">{item.language.toUpperCase()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.is_published
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.is_published ? "Veröffentlicht" : "Entwurf"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Testimonial wirklich löschen?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {testimonials?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Keine Testimonials vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestimonialsAdmin;
