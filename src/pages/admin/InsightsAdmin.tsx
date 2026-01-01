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

interface Insight {
  id: string;
  title: string;
  slug: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  language: string;
  is_published: boolean | null;
  published_at: string | null;
}

const emptyInsight: Partial<Insight> = {
  title: "",
  slug: "",
  content: "",
  featured_image: "",
  meta_title: "",
  meta_description: "",
  language: "de",
  is_published: false,
};

const InsightsAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Insight> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ["admin-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Insight[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<Insight>) => {
      const saveData = {
        ...item,
        published_at: item.is_published ? new Date().toISOString() : null,
      };
      
      if (item.id) {
        const { error } = await supabase
          .from("insights")
          .update(saveData)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("insights").insert([saveData as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insights"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Insight gespeichert" });
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
      const { error } = await supabase.from("insights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insights"] });
      toast({ title: "Insight gelöscht" });
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
    setEditingItem({ ...emptyInsight });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Insight) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem?.title) {
      toast({
        title: "Fehler",
        description: "Titel ist erforderlich",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(editingItem);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
        return map[match];
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
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
        <h1 className="text-2xl font-bold">Insights / Blog</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Insight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? "Insight bearbeiten" : "Neuer Insight"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input
                    value={editingItem?.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingItem((prev) => ({
                        ...prev,
                        title,
                        slug: prev?.slug || generateSlug(title),
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editingItem?.slug || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Inhalt</Label>
                <Textarea
                  value={editingItem?.content || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={10}
                  placeholder="Markdown wird unterstützt..."
                />
              </div>

              <div className="space-y-2">
                <Label>Beitragsbild URL</Label>
                <Input
                  value={editingItem?.featured_image || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, featured_image: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Titel</Label>
                  <Input
                    value={editingItem?.meta_title || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, meta_title: e.target.value }))
                    }
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label>Meta Beschreibung</Label>
                <Textarea
                  value={editingItem?.meta_description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, meta_description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem?.is_published ?? false}
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
              <th className="text-left p-4 text-sm font-medium">Titel</th>
              <th className="text-left p-4 text-sm font-medium">Sprache</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Erstellt</th>
              <th className="text-right p-4 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {insights?.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-4">{item.title}</td>
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
                <td className="p-4 text-muted-foreground">
                  {new Date(item.published_at || "").toLocaleDateString("de")}
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
                      if (confirm("Insight wirklich löschen?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {insights?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Keine Insights vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsightsAdmin;
