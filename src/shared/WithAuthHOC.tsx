import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function withAuthHOC(WrappedComponent: React.FC): React.FC {
  function WithAuth(props: any): JSX.Element {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
      return <>Loading....</>;
    } else {
      return <WrappedComponent {...props} />;
      return <>Loading....</>;
    }
  }
  WithAuth.displayName = `withAuthHOC(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return WithAuth;
}
