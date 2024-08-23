import React, { useContext, useEffect, useState } from "react";
import { Header, AuthHeartBeat } from "@ginger-society/ginger-ui";
import styles from "./header.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IAMService } from "@/services";
import { AuthContext } from "@/shared/AuthContext";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "@/shared/references";
import version from "@/shared/version.json";
import {
  useWorkspaces,
  WorkspaceProvider,
} from "@/components/organisms/WorkspaceSwitcher/WorkspaceContext";
import router from "@/shared/router";

interface HeaderContainerProps {
  children?: React.ReactNode;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const { docId, docName, org_id } = useParams<{
    docId: string;
    docName?: string;
    org_id: string;
  }>();
  const { orgs } = useWorkspaces();

  const { user } = useContext(AuthContext);

  const logOut = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await IAMService.identityLogout({ logoutRequest: { refreshToken } });
      }
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");
      location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/login`;
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToHome = () => {
    if (org_id) {
      navigate(`/${org_id}/stage`);
    } else {
      if (orgs.length > 0) {
        const woskspaceInLocalStorage = localStorage.getItem("workspace-id");
        if (orgs.find((o) => o.slug === woskspaceInLocalStorage)) {
          router.navigate(`/${woskspaceInLocalStorage}/stage`);
        } else {
          router.navigate(`/${orgs[0].slug}/stage`);
        }
      }
    }
  };

  const refreshTokenFn = async (refreshToken: string) => {
    const tokens = await IAMService.identityRefreshToken({
      refreshTokenRequest: { refreshToken },
    });
    return tokens.accessToken;
  };

  return (
    <>
      {user && (
        <>
          <AuthHeartBeat refreshTokenFn={refreshTokenFn} />
          <Header
            version={version.version}
            brandName={
              <span onClick={navigateToHome} className={styles["home-link"]}>
                <strong>Ginger Society</strong> &gt; Dev Portal
              </span>
            }
            user={{
              name: user?.firstName || user.sub.split("@")[0],
              email: user?.sub,
            }}
            icon={<img className={styles["icon"]} src="/ginger-db.png"></img>}
            onLogout={logOut}
            showThemeSwitcher={true}
            arbitaryContent={children}
          />
        </>
      )}
    </>
  );
};

export default HeaderContainer;
