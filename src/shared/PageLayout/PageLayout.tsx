import HeaderContainer from "@/components/atoms/HeaderContainer";
import styles from "./pageLayout.module.scss";
import { SideMenu } from "@ginger-society/ginger-ui";
import { sideMenuOptions } from "./sideMenuConfig";
import { ReactNode, useState } from "react";
import router from "../router";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const [activeItem, setActiveItem] = useState("db.schemas");

  const handleMenuChange = (newId: string) => {
    setActiveItem(newId);
    if (newId === "service.specs") {
      router.navigate("/services");
    } else if (newId === "db.schemas") {
      router.navigate("/");
    }
  };
  return (
    <div className={styles["container"]}>
      <HeaderContainer />

      <div className={styles["list-page-layout"]}>
        <SideMenu
          options={sideMenuOptions}
          active={activeItem}
          onChange={handleMenuChange}
        />
        <div className={styles["children-container"]}>{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
