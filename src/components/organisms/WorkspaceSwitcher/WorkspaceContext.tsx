import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { MetadataService } from "@/services";
import { WorkspaceSummary } from "@/services/MetadataService_client";

interface WorkspaceContextProps {
  orgs: WorkspaceSummary[];
  fetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [orgs, setOrgs] = useState<WorkspaceSummary[]>([]);

  const fetchWorkspaces = async () => {
    try {
      const response = await MetadataService.metadataGetWorkspaces();
      setOrgs(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider value={{ orgs, fetchWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaces = (): WorkspaceContextProps => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaces must be used within a WorkspaceProvider");
  }
  return context;
};
