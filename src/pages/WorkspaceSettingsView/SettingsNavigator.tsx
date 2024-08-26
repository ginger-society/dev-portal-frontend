import router from "@/shared/router";
import { useParams } from "react-router-dom";
import styles from "./seiingsNavigation.module.scss";
import { Button, ButtonType, Text } from "@ginger-society/ginger-ui";
import { FaArrowLeft, FaKey, FaUsersCog } from "react-icons/fa";

const SettingsNavigator = ({
  width,
  active,
}: {
  width: string;
  active: string;
}) => {
  const { org_id } = useParams<{ org_id: string }>();
  const navigateToWorkspaceSettings = (settingsType: string) => {
    router.navigate(`/manage-workspaces/${org_id}/${settingsType}`);
  };

  const navigateToWorkspaces = () => {
    router.navigate("/manage-workspaces");
  };

  return (
    <div style={{ width }} className={styles["container"]}>
      <Button
        onClick={navigateToWorkspaces}
        type={ButtonType.Tertiary}
        fullWidth
        label={
          <>
            <FaArrowLeft /> Go back
          </>
        }
      />
      <ul>
        <li
          className={`${styles["item"]}  ${
            active === "members" ? styles["active"] : ""
          } `}
          onClick={() => navigateToWorkspaceSettings("members")}
        >
          <Text>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <FaUsersCog />
              Members
            </div>
          </Text>
        </li>
        <li
          className={`${styles["item"]}  ${
            active === "tokens" ? styles["active"] : ""
          } `}
          onClick={() => navigateToWorkspaceSettings("tokens")}
        >
          <Text>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <FaKey />
              Tokens
            </div>
          </Text>
        </li>
      </ul>
    </div>
  );
};
export default SettingsNavigator;
