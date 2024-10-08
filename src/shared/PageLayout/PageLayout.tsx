import HeaderContainer from "@/components/atoms/HeaderContainer";
import styles from "./pageLayout.module.scss";
import { SideMenu } from "@ginger-society/ginger-ui";
import { ROUTES, sideMenuOptions } from "./sideMenuConfig";
import { ReactNode, useEffect, useState } from "react";
import router from "../router";
import { useLocation } from "react-router-dom";
// import BreadcrumContainer from "@/components/atoms/BreadcrumbContainer";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const location = useLocation();

  useEffect(() => {
    Object.keys(ROUTES).forEach((key) => {
      if (location.pathname.startsWith(ROUTES[key].url)) {
        setActiveItem(key);
      }
    });
  }, [location]);

  const [activeItem, setActiveItem] = useState("db.schemas");

  const handleMenuChange = (newId: string) => {
    setActiveItem(newId);
    router.navigate(ROUTES[newId].url);
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
        <div className={styles["children-container"]}>
          {/* <BreadcrumContainer /> */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
