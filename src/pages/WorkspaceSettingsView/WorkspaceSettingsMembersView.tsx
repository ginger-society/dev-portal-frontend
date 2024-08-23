import HeaderContainer from "@/components/atoms/HeaderContainer";
import { useParams } from "react-router-dom";
import { Text, TextSize } from "@ginger-society/ginger-ui";
import { FaRegBuilding } from "react-icons/fa";
import styles from "./workspaceSettingsView.module.scss";
import Navigator from "./SettingsNavigator";

const WorkspaceSettingsMemberPage = () => {
  const { org_id } = useParams<{ org_id: string }>();

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
          <Navigator width="20%" active="members" />
          <div style={{ width: "80%", paddingLeft: "20px" }}>
            <Text size={TextSize.Large}>Members</Text>
            {[1, 2, 3, 4].map(() => {
              return (
                <div className={styles["member-container"]}>
                  <Text>Member</Text>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsMemberPage;
