import { useWorkspaces } from "@/components/organisms/WorkspaceSwitcher/WorkspaceContext";
import router from "@/shared/router";
import { HandleLoginRedirect } from "@ginger-society/ginger-ui";
import { useEffect } from "react";

export const HandleNavigation = () => {
  const { orgs, fetchWorkspaces } = useWorkspaces();

  useEffect(() => {
    if (orgs.length > 0) {
      const woskspaceInLocalStorage = localStorage.getItem("workspace-id");
      if (orgs.find((o) => o.slug === woskspaceInLocalStorage)) {
        router.navigate(`/${woskspaceInLocalStorage}/stage`);
      } else {
        router.navigate(`/${orgs[0].slug}/stage`);
      }
    }
  }, [orgs]);

  const navigateToHome = () => {
    fetchWorkspaces();
  };
  return <HandleLoginRedirect handleNavigation={navigateToHome} />;
};

export default HandleNavigation;
