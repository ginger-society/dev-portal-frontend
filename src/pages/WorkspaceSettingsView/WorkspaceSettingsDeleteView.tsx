import HeaderContainer from "@/components/atoms/HeaderContainer";
import { useParams } from "react-router-dom";
import {
  Button,
  ButtonType,
  ConfirmationButton,
  Input,
  Text,
  TextColor,
  TextSize,
  TextWeight,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import { FaArrowLeft, FaRegBuilding } from "react-icons/fa";
import styles from "./workspaceSettingsView.module.scss";
import Navigator from "./SettingsNavigator";
import { useEffect, useState } from "react";
import { MetadataService } from "@/services";
import { WorkspaceSummaryResponse } from "@/services/MetadataService_client";
import router from "@/shared/router";
import { useWorkspaces } from "@/components/organisms/WorkspaceSwitcher/WorkspaceContext";

const WorkspaceSettingsDeletePage = () => {
  const { org_id } = useParams<{ org_id: string }>();
  const [confirmSlug, setConfirmSlug] = useState<string>();
  const { show } = useSnackbar();
  const { fetchWorkspaces } = useWorkspaces();

  const [workspace, setWorkspace] = useState<WorkspaceSummaryResponse>();

  const fetchWorkspace = async () => {
    if (!org_id) {
      return;
    }
    const workspaceDetails = await MetadataService.metadataGetWorkspaceDetails({
      orgId: org_id,
    });

    setWorkspace(workspaceDetails);
  };

  useEffect(() => {
    fetchWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteWorkspace = async () => {
    if (!org_id) {
      return;
    }
    try {
      await MetadataService.metadataDeleteWorkspace({ orgId: org_id });
      router.navigate("/manage-workspaces");
      fetchWorkspaces();
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToWorkspaces = () => {
    router.navigate("/manage-workspaces");
  };
  return (
    <div style={{ background: "var(--primary-bg-color)", minHeight: "100vh" }}>
      <HeaderContainer />
      <div className="workspace-container">
        <Text tag="h2" size={TextSize.XLarge}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              onClick={navigateToWorkspaces}
              type={ButtonType.Tertiary}
              label={
                <>
                  <FaArrowLeft /> Go back
                </>
              }
            />{" "}
            <FaRegBuilding size={30} fill="var(--primary-color)" />{" "}
            {workspace?.name} - {workspace?.slug}
          </div>
        </Text>
        <br />
        <div style={{ display: "flex" }}>
          <Navigator width="20%" active="delete" />
          <div style={{ width: "80%", paddingLeft: "20px" }}>
            <div style={{ display: "flex" }}>
              <Text size={TextSize.Large}>Delete workspace</Text>
            </div>
            <Text>
              Be carefull, it will not be easy if you want this workspace back.
              Regardless , creating a new one with the same slug would be just
              fine. Unless someone else takes this workspace once you delete it
            </Text>
            <br />
            <br />
            <Text>
              Enter <strong>{workspace?.slug}</strong> to confirm and click on
              delete button below
            </Text>
            <br />
            <br />
            <Input
              label="Confirm the workspace ID"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
            />
            <br />
            <ConfirmationButton
              title = "Are you sure ?"
              description = "This is not reversible"
              confirmButtonLabel= "Yes, I am sure"
              okBtnType = {ButtonType.Danger}
              onClick={deleteWorkspace}
              disabled={confirmSlug !== workspace?.slug}
              label={<Text color={TextColor.Danger}>Delete</Text>}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsDeletePage;
