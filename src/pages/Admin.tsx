import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, FolderOpen, MessageSquare, FileText, Lightbulb, Mail, Eye, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

  const NavContent = () => (
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
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="p-4 border-b border-border">
                  <Link to="/" className="text-lg font-bold tracking-tight font-logo">
                    UNIQUEVISIONS
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
                </div>
                <div className="p-4">
                  <NavContent />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Ausloggen
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="text-lg md:text-xl font-bold tracking-tight font-logo">
              UNIQUEVISIONS
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Ausloggen</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 lg:w-64 min-h-[calc(100vh-65px)] border-r border-border bg-card/50 p-4 sticky top-[65px]">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
