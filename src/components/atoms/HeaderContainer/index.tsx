import { auth } from "@/shared/firebase";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Header } from "@ginger-society/ginger-ui";
import styles from "./header.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

  return (
    <>
      {auth.currentUser?.email && (
        <Header
          brandName={
            <span>
              <span onClick={navigateToHome} className={styles["home-link"]}>
                <strong>Ginger Society</strong> &gt; DB Designer Home
              </span>
              {schemaIdInView && <> &gt; Editing : {docName}</>}
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
      )}
    </>
  );
};

export default HeaderContainer;
