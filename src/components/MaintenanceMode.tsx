import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaintenanceMode = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Coming Soon
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Diese Seite befindet sich derzeit in Bearbeitung. 
          Wir arbeiten an etwas Großartigem – bleiben Sie dran!
        </p>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            <Lock className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Alle Rechte vorbehalten
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
