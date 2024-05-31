import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import RedirectToSSO from "../components/atoms/redirectToSSO/RedirectToSSO";

export function withAuthHOC(WrappedComponent: React.FC): React.FC {
  function WithAuth(props: any): JSX.Element {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
      return <>Loading....</>;
    } else {
      return isAuthenticated ? (
        <WrappedComponent {...props} />
      ) : (
        <RedirectToSSO />
      );
    }
  }
  WithAuth.displayName = `withAuthHOC(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return WithAuth;
}
