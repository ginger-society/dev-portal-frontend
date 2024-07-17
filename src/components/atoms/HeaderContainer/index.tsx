import { auth } from "@/shared/firebase";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Header, AuthHeartBeat } from "@ginger-society/ginger-ui";
import styles from "./header.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IAMService } from "@/services";
interface HeaderContainerProps {
  children?: React.ReactNode;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ children }) => {
  const [schemaIdInView, setSchemaIdInView] = useState<string | null>();
  const navigate = useNavigate();
  const { docId, docName } = useParams<{ docId: string; docName?: string }>();

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
      await signOut(auth);
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
      {auth.currentUser?.email && (
        <>
          <AuthHeartBeat refreshTokenFn={refreshTokenFn} />
          <Header
            brandName={
              <span onClick={navigateToHome} className={styles["home-link"]}>
                <strong>Ginger Society</strong> &gt; DB Designer Home
              </span>
            }
            user={{
              name: auth.currentUser?.email.split("@")[0],
              email: auth.currentUser?.email,
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
