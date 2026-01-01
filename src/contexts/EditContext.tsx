import React, { createContext, useContext, useState } from "react";

interface EditContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  pendingChanges: Map<string, any>;
  setPendingChange: (key: string, value: any) => void;
  clearPendingChanges: () => void;
  isSaving: boolean;
  setIsSaving: (value: boolean) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const setPendingChange = (key: string, value: any) => {
    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });
  };

  const clearPendingChanges = () => {
    setPendingChanges(new Map());
  };

  return (
    <EditContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        pendingChanges,
        setPendingChange,
        clearPendingChanges,
        isSaving,
        setIsSaving,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within an EditProvider");
  }
  return context;
};
