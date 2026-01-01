import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import ContentAdmin from "./pages/admin/ContentAdmin";
import InsightsAdmin from "./pages/admin/InsightsAdmin";
import ContactsAdmin from "./pages/admin/ContactsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />}>
                <Route index element={<ProjectsAdmin />} />
                <Route path="projects" element={<ProjectsAdmin />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="content" element={<ContentAdmin />} />
                <Route path="insights" element={<InsightsAdmin />} />
                <Route path="contacts" element={<ContactsAdmin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
