import HeaderContainer from "@/components/atoms/HeaderContainer";
import { useParams } from "react-router-dom";
import {
  Button,
  ButtonType,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  SnackbarTimer,
  Text,
  TextColor,
  TextSize,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import { FaArrowLeft, FaCopy, FaRegBuilding } from "react-icons/fa";
import styles from "./workspaceSettingsView.module.scss";
import Navigator from "./SettingsNavigator";
import { useEffect, useState } from "react";
import { IAMService, MetadataService } from "@/services";
import { WorkspaceSummaryResponse } from "@/services/MetadataService_client";
import {
  CreateApiTokenResponse,
  GroupApiTokenResponse,
} from "@/services/IAMService_client";
import router from "@/shared/router";

const WorkspaceSettingsTokensPage = () => {
  const { org_id } = useParams<{ org_id: string }>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tokenName, setTokenName] = useState<string>();
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number>();
  const [tokens, setTokens] = useState<GroupApiTokenResponse[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceSummaryResponse>();
  const [tokenResponse, setTokenResponse] = useState<CreateApiTokenResponse>();

  const { show } = useSnackbar();

  const fetchTokens = async () => {
    if (!org_id) {
      return;
    }
    const workspaceDetails = await MetadataService.metadataGetWorkspaceDetails({
      orgId: org_id,
    });

    setWorkspace(workspaceDetails);

    const tokenList = await IAMService.identityGetApiTokensByGroup({
      groupIdentifier: workspaceDetails.groupId,
    });

    setTokens(
      tokenList.map((t) => {
        return {
          ...t,
          createdAt: new Date(t.createdAt),
          expiryDate: new Date(t.expiryDate),
        };
      })
    );
  };

  const openCreateTokenForm = () => {
    setIsOpen(true);
  };

  const createToken = async () => {
    if (!tokenExpiresIn || !tokenName || !workspace?.groupId) {
      return;
    }
    const data = await IAMService.identityCreateApiToken({
      createApiTokenRequest: {
        daysToExpire: tokenExpiresIn,
        name: tokenName,
        groupIdentifier: workspace?.groupId,
      },
    });
    setTokenResponse(data);
  };

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyTokenToClipboard = () => {
    if (tokenResponse?.apiToken) {
      navigator.clipboard
        .writeText(tokenResponse.apiToken)
        .then(() => {
          show("Token copied to clipboard!", SnackbarTimer.Medium);
        })
        .catch((err) => {
          console.error("Failed to copy token: ", err);
          alert("Failed to copy token to clipboard.");
        });
    }
  };

  const deactivateToken = async (id: number, index: number) => {
    try {
      const _ = await IAMService.identityDeactivateApiToken({ tokenId: id });
      show("Deactivated successfully", SnackbarTimer.Short);
      fetchTokens();
    } catch (error) {
      console.log(error);
      show(
        "Unable to deactivate, please reach out to support on discord",
        SnackbarTimer.Short
      );
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
          <Navigator width="20%" active="tokens" />
          <div style={{ width: "80%", paddingLeft: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text size={TextSize.Large}>Tokens</Text>
              <Button
                onClick={openCreateTokenForm}
                label="Create token"
              ></Button>
            </div>
            {tokens.map((token, index) => {
              return (
                <div
                  key={token.name}
                  className={styles["pipeline-token-container"]}
                >
                  <Text>{token.name}</Text>
                  <Text
                    color={
                      !token.isActive ? TextColor.Danger : TextColor.Primary
                    }
                    size={TextSize.Small}
                  >
                    {token.isActive
                      ? `Expires on: ${token.expiryDate.toLocaleDateString()}`
                      : `Deactivated`}
                  </Text>
                  <Text size={TextSize.Small}>
                    Created on: {token.createdAt.toLocaleDateString()}
                  </Text>
                  {token.isActive && (
                    <Button
                      onClick={() => deactivateToken(token.pk, index)}
                      label={"Deactivate"}
                      confirmConfig={{
                        title: "Are you sure ?",
                        description: "This is not reversible",
                        confirmButtonLabel: "Yes, I am sure",
                        okBtnType: ButtonType.Danger,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size={ModalSize.Large}
          preventCancelOnOverlay
        >
          <ModalHeader>Create token</ModalHeader>
          <ModalBody>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {!tokenResponse?.apiToken && (
                <>
                  <Input
                    label="Name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                  <Input
                    label="Expires in"
                    type="number"
                    value={tokenExpiresIn}
                    onChange={(e) => setTokenExpiresIn(e.target.valueAsNumber)}
                  />
                </>
              )}

              {tokenResponse?.apiToken && (
                <>
                  <Text>
                    This is the only time you will be able to copy this API
                    token, please copy and use it at the approperiate place else
                    you will need to create a new one.
                  </Text>
                  <span
                    style={{
                      padding: "20px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      background: "var(--primary-accent-color)",
                      cursor: "pointer",
                      borderRadius: "20px",
                      whiteSpace: "normal", // Allow text to wrap
                      overflowWrap: "anywhere", // Break long words
                    }}
                  >
                    {tokenResponse?.apiToken}
                  </span>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              {!tokenResponse?.apiToken ? (
                <Button
                  onClick={createToken}
                  type={ButtonType.Primary}
                  label="Create"
                />
              ) : (
                <Button
                  onClick={copyTokenToClipboard}
                  type={ButtonType.Primary}
                  label={"Copy to clipboard"}
                  endEnhancer={<FaCopy />}
                />
              )}

              <Button
                onClick={() => setIsOpen(false)}
                type={ButtonType.Tertiary}
                label="Cancel"
              />
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default WorkspaceSettingsTokensPage;
