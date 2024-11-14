import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { LoadingPage } from "@ginger-society/ginger-ui";

export function withAuthHOC(WrappedComponent: React.FC): React.FC {
  function WithAuth(props: any): JSX.Element {
    const { loading } = useContext(AuthContext);

    if (loading) {
      return <LoadingPage />;
    } else {
      return <WrappedComponent {...props} />;
    }
  }
  WithAuth.displayName = `withAuthHOC(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return WithAuth;
}
