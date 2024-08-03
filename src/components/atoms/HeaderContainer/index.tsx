import React, { useContext, useEffect, useState } from "react";
import { Header, AuthHeartBeat } from "@ginger-society/ginger-ui";
import styles from "./header.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IAMService } from "@/services";
import { AuthContext } from "@/shared/AuthContext";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "@/shared/references";
interface HeaderContainerProps {
  children?: React.ReactNode;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ children }) => {
  const [schemaIdInView, setSchemaIdInView] = useState<string | null>();
  const navigate = useNavigate();
  const { docId, docName } = useParams<{ docId: string; docName?: string }>();

  const { user } = useContext(AuthContext);

  const router = useLocation();

  useEffect(() => {
    if (router.pathname === "/") {
      setSchemaIdInView(null);
    } else if (router.pathname.startsWith("/editor")) {
      setSchemaIdInView(router.pathname.split("/editor/")[1]);
    }
  }, [router]);

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
    navigate("/");
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
            brandName={
              <span onClick={navigateToHome} className={styles["home-link"]}>
                <strong>Ginger Society</strong> &gt; Metadata Service
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
