import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { MetadataService } from "@/services";
import { WorkspaceSummaryResponse } from "@/services/MetadataService_client";

interface WorkspaceContextProps {
  orgs: WorkspaceSummaryResponse[];
  fetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [orgs, setOrgs] = useState<WorkspaceSummaryResponse[]>([]);

  const fetchWorkspaces = async () => {
    try {
      const response = await MetadataService.metadataGetWorkspaces();
      setOrgs(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("calling");
    console.log(location.hash);
    if (!location.hash.startsWith("#/public/")) {
      fetchWorkspaces();
    }
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
