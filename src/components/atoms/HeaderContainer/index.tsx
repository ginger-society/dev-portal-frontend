import React, { useContext, useEffect, useState } from "react";
import {
  Header,
  AuthHeartBeat,
  HeaderPositionEnum,
  AuthContext, AuthContextInterface
} from "@ginger-society/ginger-ui";
import styles from "./header.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IAMService } from "@/services";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "@/shared/references";
import version from "@/shared/version.json";
import {
  useWorkspaces,
  WorkspaceProvider,
} from "@/components/organisms/WorkspaceSwitcher/WorkspaceContext";
import router from "@/shared/router";
import { ValidateTokenResponse } from "@/services/IAMService_client";

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
  const { orgs, fetchWorkspaces } = useWorkspaces();

  const { user } = useContext<AuthContextInterface<ValidateTokenResponse>>(AuthContext);

  const logOut = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await IAMService.identityLogout({ logoutRequest: { refreshToken } });
      }
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");
      location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/logout`;
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToHome = () => {
    if (org_id) {
      navigate(`/${org_id}/stage`);
    } else {
      console.log(orgs);

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

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {user && (
        <>
          <AuthHeartBeat refreshTokenFn={refreshTokenFn} />
          <Header
            position={HeaderPositionEnum.Fixed}
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
            icon={
              <img
                className={styles["icon"]}
                src="https://www.gingersociety.org/img/ginger-dev-portal-icon.png"
              ></img>
            }
            onLogout={logOut}
            showThemeSwitcher={false}
            arbitaryContent={children}
          />
        </>
      )}
    </>
  );
};

export default HeaderContainer;
