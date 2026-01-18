import React from "react";
import { useEditContext } from "@/contexts/EditContext";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Eye, Pencil, RotateCcw, Undo2 } from "lucide-react";

interface EditorToolbarProps {
  onSave: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  hasChanges: boolean;
  canUndo?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onReset,
  onUndo,
  hasChanges,
  canUndo = false,
}) => {
  const { isEditMode, setIsEditMode, isSaving } = useEditContext();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
      <Button
        variant={isEditMode ? "default" : "ghost"}
        size="sm"
        onClick={() => setIsEditMode(!isEditMode)}
        className="rounded-full"
      >
        {isEditMode ? (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Vorschau
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4 mr-2" />
            Bearbeiten
          </>
        )}
      </Button>

      {isEditMode && canUndo && onUndo && (
        <>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={isSaving}
            className="rounded-full"
            title="Rückgängig (Strg+Z)"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Rückgängig
          </Button>
        </>
      )}

      {hasChanges && (
        <>
          <div className="w-px h-6 bg-border" />
          
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Zurücksetzen
            </Button>
          )}

          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </>
      )}

      {!hasChanges && isEditMode && !canUndo && (
        <span className="text-sm text-muted-foreground px-2">
          Klicke auf Elemente zum Bearbeiten
        </span>
      )}
    </div>
  );
};

export default EditorToolbar;
