import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2, Mail, MailOpen } from "lucide-react";
import { useState } from "react";

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  package: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

const ContactsAdmin = () => {
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setSelectedContact(null);
      toast({ title: "Anfrage gelöscht" });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.is_read) {
      markReadMutation.mutate({ id: contact.id, is_read: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = contacts?.filter((c) => !c.is_read).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Kontaktanfragen</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {unreadCount} neu
            </span>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium w-10"></th>
              <th className="text-left p-4 text-sm font-medium">Name</th>
              <th className="text-left p-4 text-sm font-medium">E-Mail</th>
              <th className="text-left p-4 text-sm font-medium">Paket</th>
              <th className="text-left p-4 text-sm font-medium">Datum</th>
              <th className="text-right p-4 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {contacts?.map((contact) => (
              <tr
                key={contact.id}
                className={`border-t border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                  !contact.is_read ? "bg-primary/5" : ""
                }`}
                onClick={() => openContact(contact)}
              >
                <td className="p-4">
                  {contact.is_read ? (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary" />
                  )}
                </td>
                <td className={`p-4 ${!contact.is_read ? "font-medium" : ""}`}>
                  {contact.first_name} {contact.last_name}
                </td>
                <td className="p-4 text-muted-foreground">{contact.email}</td>
                <td className="p-4">{contact.package || "-"}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(contact.created_at).toLocaleDateString("de")}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Anfrage wirklich löschen?")) {
                        deleteMutation.mutate(contact.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {contacts?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Keine Kontaktanfragen vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kontaktanfrage</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paket</p>
                  <p className="font-medium">{selectedContact.package || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="font-medium">
                    {new Date(selectedContact.created_at).toLocaleString("de")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Nachricht</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    markReadMutation.mutate({
                      id: selectedContact.id,
                      is_read: !selectedContact.is_read,
                    })
                  }
                >
                  {selectedContact.is_read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Anfrage wirklich löschen?")) {
                      deleteMutation.mutate(selectedContact.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsAdmin;
