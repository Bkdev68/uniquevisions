import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, FolderOpen, MessageSquare, FileText, Lightbulb, Mail, Eye, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { label: "Visual Editor", path: "/admin/visual", icon: Eye },
  { label: "Projekte", path: "/admin/projects", icon: FolderOpen },
  { label: "Testimonials", path: "/admin/testimonials", icon: MessageSquare },
  { label: "Site-Inhalte", path: "/admin/content", icon: FileText },
  { label: "Insights", path: "/admin/insights", icon: Lightbulb },
  { label: "Kontaktanfragen", path: "/admin/contacts", icon: Mail },
  { label: "Einstellungen", path: "/admin/settings", icon: Settings },
];

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Kein Admin-Zugang
          </h1>
          <p className="text-muted-foreground mb-6">
            Du hast keine Berechtigung für das Admin-Dashboard.
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Zur Website
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Ausloggen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold tracking-tight">
              UNIQUEVISIONS
            </Link>
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Ausloggen
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-65px)] border-r border-border bg-card/50 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === "/admin/projects" && location.pathname === "/admin");
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
