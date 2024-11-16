import { FaBuilding, FaCheck } from "react-icons/fa";
import styles from "./workspaceSwitcher.module.scss";
import { Button, ButtonType, Dropdown } from "@ginger-society/ginger-ui";
import router from "@/shared/router";
import { useParams } from "react-router-dom";
import { useWorkspaces } from "./WorkspaceContext";
import { useEffect, useMemo } from "react";

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

  const org_selected = useMemo(() => {
    return orgs.find((o) => o.slug === org_id);
  }, [orgs, org_id]);

  return (
    <Dropdown
      label={
        <Button
          label={
            <>
              <FaBuilding />
              {org_selected?.name} @ {org_selected?.version}
            </>
          }
        ></Button>
      }
      align="left"
    >
      <ul style={{listStyleType: 'none', paddingInlineStart: 0}}>
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
        
        <div style={{padding: '10px', paddingBottom: 0}}>
          <Button
            label={"Manage workspaces"}
            onClick={navigateToManageWorkspace}
            fullWidth
            type={ButtonType.Primary}>
          </Button>
        </div>
      </ul>
    </Dropdown>
  );
};

export default WorkspaceSwitcher;
