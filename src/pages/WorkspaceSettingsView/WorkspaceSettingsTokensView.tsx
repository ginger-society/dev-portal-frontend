import HeaderContainer from "@/components/atoms/HeaderContainer";
import { useParams } from "react-router-dom";
import { Text, TextColor, TextSize } from "@ginger-society/ginger-ui";
import { FaRegBuilding } from "react-icons/fa";
import styles from "./workspaceSettingsView.module.scss";
import Navigator from "./SettingsNavigator";
import { useState } from "react";

interface Token {
  createdAt: Date;
  name: string;
  expired: boolean;
}

const mockTokens: Token[] = [
  { createdAt: new Date(), name: "Pipeline 1", expired: false },
  { createdAt: new Date(), name: "Pipeline 3", expired: true },
  { createdAt: new Date(), name: "Pipeline 4", expired: false },
  { createdAt: new Date(), name: "Pipeline 5", expired: false },
];

const WorkspaceSettingsTokensPage = () => {
  const { org_id } = useParams<{ org_id: string }>();

  const [tokens, setTokens] = useState<Token[]>(mockTokens);

  return (
    <div style={{ background: "var(--primary-bg-color)", minHeight: "100vh" }}>
      <HeaderContainer />
      <div
        style={{ paddingLeft: "20%", paddingRight: "20%", paddingTop: "50px" }}
      >
        <Text tag="h2" size={TextSize.XLarge}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaRegBuilding size={30} fill="var(--primary-color)" /> {org_id}
          </div>
        </Text>
        <br />

        <div style={{ display: "flex" }}>
          <Navigator width="20%" active="tokens" />
          <div style={{ width: "80%", paddingLeft: "20px" }}>
            <Text size={TextSize.Large}>Tokens</Text>
            {tokens.map((token) => {
              return (
                <div className={styles["pipeline-token-container"]}>
                  <Text>{token.name}</Text>
                  <Text
                    color={token.expired ? TextColor.Danger : TextColor.Primary}
                    size={TextSize.Small}
                  >
                    {!token.expired
                      ? `Expiry in : 3 days`
                      : "Expired 1 days ago"}
                  </Text>
                  <Text size={TextSize.Small}>Created 3 days ago</Text>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsTokensPage;
