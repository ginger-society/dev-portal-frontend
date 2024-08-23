import { FaBuilding } from "react-icons/fa";
import styles from "./workspaceSwitcher.module.scss";
import { Button, Dropdown } from "@ginger-society/ginger-ui";
import router from "@/shared/router";
import { useEffect, useState } from "react";
import { MetadataService } from "@/services";
import { WorkspaceSummary } from "@/services/MetadataService_client";

const WorkspaceSwitcher = () => {
  const [orgs, setOrgs] = useState<WorkspaceSummary[]>([]);

  const navigateToManageWorkspace = () => {
    router.navigate("/manage-workspaces");
  };

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

  const switchWorkspace = (workspaceId: string) => {
    router.navigate(`/${workspaceId}/stage`);
  };

  return (
    <Dropdown
      label={
        <Button
          label={
            <>
              <FaBuilding />
              Ginger Society
            </>
          }
        ></Button>
      }
      align="left"
    >
      <ul>
        {orgs.map((org) => {
          return (
            <li
              onClick={() => switchWorkspace(org.slug)}
              className={styles["org-item"]}
            >
              <FaBuilding />
              {org.name}
            </li>
          );
        })}
        <button
          className={styles["new-org-btn"]}
          onClick={navigateToManageWorkspace}
        >
          Manage workspaces
        </button>
      </ul>
    </Dropdown>
  );
};

export default WorkspaceSwitcher;
