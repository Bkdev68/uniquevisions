import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Mail, TestTube, Lock, Globe } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string | null;
}

const SettingsAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notificationEmail, setNotificationEmail] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(true);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*");
      if (error) throw error;
      return data as Setting[];
    },
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (settings) {
      const emailSetting = settings.find((s) => s.key === "notification_email");
      if (emailSetting?.value) {
        setNotificationEmail(emailSetting.value);
      }
      const maintenanceSetting = settings.find((s) => s.key === "maintenance_mode");
      setMaintenanceMode(maintenanceSetting?.value !== "false");
    }
  }, [settings]);

  // Save email mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "notification_email", value: notificationEmail }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({
        title: "Gespeichert",
        description: "Die Einstellungen wurden erfolgreich gespeichert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Maintenance mode mutation
  const maintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "maintenance_mode", value: enabled ? "true" : "false" }, { onConflict: "key" });
      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({
        title: enabled ? "Wartungsmodus aktiviert" : "Seite ist jetzt öffentlich",
        description: enabled 
          ? "Besucher sehen jetzt die 'Coming Soon'-Seite." 
          : "Die Seite ist jetzt für alle Besucher zugänglich.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMaintenanceToggle = (checked: boolean) => {
    setMaintenanceMode(checked);
    maintenanceMutation.mutate(checked);
  };

  // Test email function
  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Fehler",
        description: "Bitte gib eine Test-E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: testEmail,
          subject: "Test-E-Mail von UNIQUEVISIONS",
          html: `
            <h1>Test erfolgreich!</h1>
            <p>Dies ist eine Test-E-Mail vom UNIQUEVISIONS CMS.</p>
            <p>Wenn du diese E-Mail erhältst, funktioniert der E-Mail-Versand korrekt.</p>
            <br>
            <p>Beste Grüße,<br>UNIQUEVISIONS</p>
          `,
          text: "Test erfolgreich! Dies ist eine Test-E-Mail vom UNIQUEVISIONS CMS.",
        },
      });

      if (error) throw error;

      toast({
        title: "Test-E-Mail gesendet",
        description: `Eine Test-E-Mail wurde an ${testEmail} gesendet.`,
      });
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({
        title: "Fehler beim Senden",
        description: error.message || "Die Test-E-Mail konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalte E-Mail- und System-Einstellungen
        </p>
      </div>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {maintenanceMode ? (
              <Lock className="h-5 w-5 text-orange-500" />
            ) : (
              <Globe className="h-5 w-5 text-green-500" />
            )}
            Wartungsmodus
          </CardTitle>
          <CardDescription>
            Aktiviere den Wartungsmodus, um die Seite vor der Öffentlichkeit zu verbergen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenance-mode">
                {maintenanceMode ? "Seite ist offline" : "Seite ist öffentlich"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {maintenanceMode 
                  ? "Besucher sehen eine 'Coming Soon'-Seite. Nur Admins können die volle Seite sehen."
                  : "Alle Besucher können die Seite normal aufrufen."}
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
              disabled={maintenanceMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Einstellungen
          </CardTitle>
          <CardDescription>
            Konfiguriere die E-Mail-Adresse für Kontaktanfragen und Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notification-email">Benachrichtigungs-E-Mail</Label>
            <p className="text-sm text-muted-foreground">
              An diese Adresse werden neue Kontaktanfragen gesendet
            </p>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="kontakt@uniquevisions.at"
            />
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            E-Mail-Test
          </CardTitle>
          <CardDescription>
            Teste die E-Mail-Konfiguration mit einer Test-Nachricht
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1"
            />
            <Button
              onClick={handleTestEmail}
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Test senden
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsAdmin;
