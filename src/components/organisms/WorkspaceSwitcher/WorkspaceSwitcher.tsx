import { FaBuilding, FaCheck } from "react-icons/fa";
import styles from "./workspaceSwitcher.module.scss";
import { Button, Dropdown } from "@ginger-society/ginger-ui";
import router from "@/shared/router";
import { useParams } from "react-router-dom";
import { useWorkspaces } from "./WorkspaceContext";
import { useEffect } from "react";

const WorkspaceSwitcher = () => {
  const { org_id } = useParams<{ org_id: string }>();
  const { orgs, fetchWorkspaces } = useWorkspaces();

  const navigateToManageWorkspace = () => {
    router.navigate("/manage-workspaces");
  };

  const switchWorkspace = (workspaceId: string) => {
    localStorage.setItem("workspace-id", workspaceId);
    router.navigate(`/${workspaceId}/stage`);
  };

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dropdown
      label={
        <Button
          label={
            <>
              <FaBuilding />
              {orgs.find((o) => o.slug === org_id)?.name}
            </>
          }
        ></Button>
      }
      align="left"
    >
      <ul>
        {orgs.map((org) => (
          <li
            key={org.slug}
            onClick={() => switchWorkspace(org.slug)}
            className={`${styles["org-item"]} ${
              org.slug === org_id ? styles["active"] : ""
            }`}
          >
            <FaBuilding />
            {org.name}

            {org.slug === org_id && <FaCheck />}
          </li>
        ))}
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
