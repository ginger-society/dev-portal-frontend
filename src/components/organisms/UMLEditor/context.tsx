import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Block,
  Connection,
  EditorData,
} from "@/components/organisms/UMLEditor/types";

interface UMLEditorContextType {
  blocks: { [key: string]: Block };
  setBlocks: React.Dispatch<React.SetStateAction<{ [key: string]: Block }>>;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  editorData?: EditorData;
  setEditorData: React.Dispatch<React.SetStateAction<EditorData | undefined>>;
}

export const UMLEditorContext = createContext<UMLEditorContextType | undefined>(
  undefined,
);

export const UMLEditorProvider: React.FC<{
  children: ReactNode;
  value: UMLEditorContextType;
}> = ({ children, value }) => {
  return (
    <UMLEditorContext.Provider value={value}>
      {children}
    </UMLEditorContext.Provider>
  );
};

export const useUMLEditor = () => {
  const context = useContext(UMLEditorContext);
  if (context === undefined) {
    throw new Error("useUMLEditor must be used within a UMLEditorProvider");
  }
  return context;
};
