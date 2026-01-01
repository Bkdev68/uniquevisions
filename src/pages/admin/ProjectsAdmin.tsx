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

interface Project {
  id: string;
  title: string;
  description: string | null;
  role: string | null;
  client: string | null;
  image_url: string | null;
  video_url: string | null;
  language: string;
  display_order: number | null;
  is_published: boolean | null;
}

const emptyProject: Partial<Project> = {
  title: "",
  description: "",
  role: "",
  client: "",
  image_url: "",
  video_url: "",
  language: "de",
  display_order: 0,
  is_published: true,
};

const ProjectsAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      if (project.id) {
        const { error } = await supabase
          .from("projects")
          .update(project)
          .eq("id", project.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([project as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDialogOpen(false);
      setEditingProject(null);
      toast({ title: "Projekt gespeichert" });
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
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Projekt gelöscht" });
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
    setEditingProject({ ...emptyProject });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject({ ...project });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingProject?.title) {
      toast({
        title: "Fehler",
        description: "Titel ist erforderlich",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(editingProject);
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
        <h1 className="text-2xl font-bold">Projekte</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Projekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject?.id ? "Projekt bearbeiten" : "Neues Projekt"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input
                    value={editingProject?.title || ""}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sprache</Label>
                  <Select
                    value={editingProject?.language || "de"}
                    onValueChange={(value) =>
                      setEditingProject((prev) => ({ ...prev, language: value }))
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
                <Label>Beschreibung</Label>
                <Textarea
                  value={editingProject?.description || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rolle</Label>
                  <Input
                    value={editingProject?.role || ""}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, role: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kunde</Label>
                  <Input
                    value={editingProject?.client || ""}
                    onChange={(e) =>
                      setEditingProject((prev) => ({ ...prev, client: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bild URL</Label>
                <Input
                  value={editingProject?.image_url || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={editingProject?.video_url || ""}
                  onChange={(e) =>
                    setEditingProject((prev) => ({ ...prev, video_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reihenfolge</Label>
                  <Input
                    type="number"
                    value={editingProject?.display_order || 0}
                    onChange={(e) =>
                      setEditingProject((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={editingProject?.is_published ?? true}
                    onCheckedChange={(checked) =>
                      setEditingProject((prev) => ({ ...prev, is_published: checked }))
                    }
                  />
                  <Label>Veröffentlicht</Label>
                </div>
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
              <th className="text-left p-4 text-sm font-medium">Reihenfolge</th>
              <th className="text-right p-4 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-t border-border">
                <td className="p-4">{project.title}</td>
                <td className="p-4">{project.language.toUpperCase()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.is_published
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {project.is_published ? "Veröffentlicht" : "Entwurf"}
                  </span>
                </td>
                <td className="p-4">{project.display_order}</td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Projekt wirklich löschen?")) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {projects?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Keine Projekte vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsAdmin;
