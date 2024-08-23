import router from "@/shared/router";
import { HandleLoginRedirect } from "@ginger-society/ginger-ui";

export const HandleNavigation = () => {
  const navigateToHome = () => {
    router.navigate("/manage-workspaces");
  };
  return <HandleLoginRedirect handleNavigation={navigateToHome} />;
};

export default HandleNavigation;
