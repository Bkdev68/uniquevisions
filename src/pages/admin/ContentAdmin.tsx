import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value_de: string | null;
  value_en: string | null;
  type: string | null;
}

const emptyContent: Partial<SiteContent> = {
  section: "",
  key: "",
  value_de: "",
  value_en: "",
  type: "text",
};

const ContentAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SiteContent> | null>(null);
  const [filterSection, setFilterSection] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contents, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section", { ascending: true });
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  const sections = [...new Set(contents?.map((c) => c.section) || [])];

  const filteredContents = filterSection === "all"
    ? contents
    : contents?.filter((c) => c.section === filterSection);

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<SiteContent>) => {
      if (item.id) {
        const { error } = await supabase
          .from("site_content")
          .update(item)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert([item as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Inhalt gespeichert" });
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
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      toast({ title: "Inhalt gelöscht" });
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
    setEditingItem({ ...emptyContent });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: SiteContent) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem?.section || !editingItem?.key) {
      toast({
        title: "Fehler",
        description: "Sektion und Schlüssel sind erforderlich",
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
        <h1 className="text-2xl font-bold">Site-Inhalte</h1>
        <div className="flex items-center gap-4">
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alle Sektionen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Sektionen</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Inhalt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingItem?.id ? "Inhalt bearbeiten" : "Neuer Inhalt"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sektion *</Label>
                    <Input
                      value={editingItem?.section || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, section: e.target.value }))
                      }
                      placeholder="z.B. hero, about, services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schlüssel *</Label>
                    <Input
                      value={editingItem?.key || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, key: e.target.value }))
                      }
                      placeholder="z.B. title, description"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select
                    value={editingItem?.type || "text"}
                    onValueChange={(value) =>
                      setEditingItem((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="image">Bild URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Wert (Deutsch)</Label>
                  {editingItem?.type === "textarea" ? (
                    <Textarea
                      value={editingItem?.value_de || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, value_de: e.target.value }))
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={editingItem?.value_de || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, value_de: e.target.value }))
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Wert (Englisch)</Label>
                  {editingItem?.type === "textarea" ? (
                    <Textarea
                      value={editingItem?.value_en || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, value_en: e.target.value }))
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={editingItem?.value_en || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, value_en: e.target.value }))
                      }
                    />
                  )}
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
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Sektion</th>
              <th className="text-left p-4 text-sm font-medium">Schlüssel</th>
              <th className="text-left p-4 text-sm font-medium">Wert (DE)</th>
              <th className="text-left p-4 text-sm font-medium">Wert (EN)</th>
              <th className="text-right p-4 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredContents?.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-4 text-primary">{item.section}</td>
                <td className="p-4">{item.key}</td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">
                  {item.value_de || "-"}
                </td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">
                  {item.value_en || "-"}
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
                      if (confirm("Inhalt wirklich löschen?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredContents?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Keine Inhalte vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentAdmin;
