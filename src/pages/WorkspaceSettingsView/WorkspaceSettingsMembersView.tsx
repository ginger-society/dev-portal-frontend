import HeaderContainer from "@/components/atoms/HeaderContainer";
import { useParams } from "react-router-dom";
import {
  Button,
  ButtonType,
  ConfirmationButton,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  Option,
  Select,
  SnackbarTimer,
  Text,
  TextSize,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import { FaArrowLeft, FaRegBuilding } from "react-icons/fa";
import styles from "./workspaceSettingsView.module.scss";
import Navigator from "./SettingsNavigator";
import { useEffect, useState } from "react";
import { IAMService, MetadataService } from "@/services";
import { UserInfoResponse } from "@/services/IAMService_client";
import { WorkspaceSummaryResponse } from "@/services/MetadataService_client";
import router from "@/shared/router";

const WorkspaceSettingsMemberPage = () => {
  const { org_id } = useParams<{ org_id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [userToAdd, setUserToAdd] = useState<string>();
  const [members, setMembers] = useState<UserInfoResponse[]>([]);
  const [memberTypeToAdd, setMemberTypeToAdd] = useState<Option>({
    value: "add-member",
    label: "Member",
  });

  const { show } = useSnackbar();

  const [workspace, setWorkspace] = useState<WorkspaceSummaryResponse>();

  const fetchUsers = async () => {
    if (!org_id) {
      return;
    }
    const workspaceDetails = await MetadataService.metadataGetWorkspaceDetails({
      orgId: org_id,
    });

    const members = await IAMService.identityGetMembers({
      groupIdentifier: workspaceDetails.groupId,
    });
    setMembers(members);
    setWorkspace(workspaceDetails);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMemberForm = () => {
    setIsOpen(true);
  };

  const addMember = async () => {
    if (!workspace?.groupId || !userToAdd) {
      console.log("Group id or userID not available");
      return;
    }
    try {
      const data = await IAMService.identityManageMembership({
        groupIdentifier: workspace.groupId,
        userId: userToAdd,
        action: memberTypeToAdd.value,
      });
      show("User added successfully", SnackbarTimer.Medium);
      setIsOpen(false);
      setMemberTypeToAdd({ value: "add-member", label: "Member" });
      setUserToAdd(undefined);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const removeMember = async (userId: string) => {
    if (!workspace?.groupId) {
      return;
    }
    await IAMService.identityManageMembership({
      groupIdentifier: workspace.groupId,
      userId: userId,
      action: "remove",
    });
    show(`User removed : ${userId}`, SnackbarTimer.Medium);
    fetchUsers();
  };

  const updateMembership = async (userId: string, actionType: string) => {
    if (!workspace?.groupId) {
      return;
    }

    try {
      await IAMService.identityManageMembership({
        groupIdentifier: workspace.groupId,
        userId: userId,
        action: "remove",
      });
      await IAMService.identityManageMembership({
        groupIdentifier: workspace.groupId,
        userId: userId,
        action: actionType,
      });
      show(
        `Membership for ${userId} updated successfully`,
        SnackbarTimer.Medium
      );
    } catch (error) {
      console.log(error);
    }
    fetchUsers();
  };

  const navigateToWorkspaces = () => {
    router.navigate("/manage-workspaces");
  };

  return (
    <div style={{ background: "var(--secondary-bg-color)", minHeight: "100vh" }}>
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
          <Navigator width="20%" active="members" />
          <div style={{ width: "80%", paddingLeft: "20px" }}>
            <div style={{ display: "flex" }}>
              <Text size={TextSize.Large}>Members</Text>

              <Button onClick={openMemberForm} type={ButtonType.Primary} label={"Add member"}></Button>
            </div>
            {members.map((member) => {
              return (
                <div className={styles["member-container"]}>
                  <Text>
                    {member.emailId} ({member.isAdmin ? "Admin" : "Member"})
                  </Text>
                  <ConfirmationButton
                    label={"Remove"}
                    onClick={() => removeMember(member.emailId)}
                    title = "Are you sure ?"
                    description = "This is not reversible"
                    confirmButtonLabel= "Yes, I am sure"
                    okBtnType = {ButtonType.Danger}
                  ></ConfirmationButton>
                  {member.isAdmin ? (
                    <Button
                      label="Change to a member"
                      onClick={() =>
                        updateMembership(member.emailId, "add-member")
                      }
                    />
                  ) : (
                    <Button
                      label="Change to admin"
                      onClick={() =>
                        updateMembership(member.emailId, "add-admin")
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size={ModalSize.Large}
      >
        <ModalHeader>Add member</ModalHeader>
        <ModalBody>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Select
              label="Membership type"
              value={memberTypeToAdd}
              options={[
                { label: "Member", value: "add-member" },
                { label: "Admin", value: "add-admin" },
              ]}
              renderer={(option) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {option.label}
                </div>
              )}
              onChange={(v) => {
                setMemberTypeToAdd(v);
              }}
            />
            <Input
              label="Email ID"
              value={userToAdd}
              onChange={(e) => setUserToAdd(e.target.value)}
            ></Input>
            <div style={{ display: "flex", gap: "20px" }}>
              <Button
                onClick={addMember}
                type={ButtonType.Primary}
                label={"Add"}
              ></Button>
              <Button
                onClick={() => setIsOpen(false)}
                type={ButtonType.Tertiary}
                label={"Cancel"}
              ></Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WorkspaceSettingsMemberPage;
