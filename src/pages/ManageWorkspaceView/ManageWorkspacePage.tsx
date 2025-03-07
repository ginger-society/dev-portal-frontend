import HeaderContainer from "@/components/atoms/HeaderContainer";
import {
  Button,
  ButtonType,
  Loader,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  Text,
  TextSize,
} from "@ginger-society/ginger-ui";
import { FaRegBuilding, FaWrench } from "react-icons/fa";
import styles from "./manageWorkspacePage.module.scss";
import { useEffect, useState } from "react";
import NewOrgForm from "./NewOrgForm";
import router from "@/shared/router";
import { MetadataService } from "@/services";
import { WorkspaceSummaryResponse } from "@/services/MetadataService_client";

const ManageWorkspacePage = () => {
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState<boolean>(false);
  const [orgs, setOrgs] = useState<WorkspaceSummaryResponse[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await MetadataService.metadataGetWorkspaces();
      setOrgs(response);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigateToWorkspaceSettings = (
    org_id: string,
    settingsType: string
  ) => {
    router.navigate(`/manage-workspaces/${org_id}/${settingsType}`);
  };

  const openWorkspace = (slug: string) => {
    router.navigate(`/${slug}/stage`);
  };

  return (
    <div style={{ background: "var(--primary-accent-color)", minHeight: "100vh" }}>
      <HeaderContainer />
      <div className="workspace-container">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text tag="h1" size={TextSize.Large}>
            Manage workspaces
          </Text>
          <div>
            <Button
              type={ButtonType.Primary}
              onClick={() => setIsCreateOrgOpen(true)}
              label={"Create new workspace"}
            ></Button>
          </div>
        </div>

        {orgs.map((org) => {
          return (
            <div
              className={styles["org-item-container"]}
              onClick={(e) => {
                openWorkspace(org.slug);
                e.stopPropagation();
              }}
            >
              <FaRegBuilding size={30} fill="var(--primary-color)" />
              <div>
                <Text size={TextSize.Small}>{org.slug}</Text> <br />
                <Text>{org.name}</Text>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {org.isAdmin && (
                  <Button
                    onClick={(e) => {
                      navigateToWorkspaceSettings(org.slug, "members");
                      e && e.stopPropagation();
                    }}
                    label={<><FaWrench
                      style={{ cursor: "pointer" }}
                      fill="var(--primary-color)"
                    />{" "} Open settings</>}
                  >
                  </Button>
                )}
                <Text>You are {org.isAdmin ? "an Admin" : "a Member"}</Text>
              </div>
            </div>
          );
        })}
        {loading && <Loader />}
      </div>
      <Modal
        isOpen={isCreateOrgOpen}
        onClose={() => setIsCreateOrgOpen(false)}
        size={ModalSize.Large}
      >
        <ModalHeader>Create a new workspace</ModalHeader>
        <ModalBody>
          <NewOrgForm
            onCancel={() => {
              fetchData();
              setIsCreateOrgOpen(false);
            }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ManageWorkspacePage;
