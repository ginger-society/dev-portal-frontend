import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./app.css";
import "../node_modules/@ginger-society/ginger-ui/dist/esm/index.css";
import "../node_modules/@ginger-society/ginger-ui-uml/dist/esm/index.css";

import router from "./shared/router";
import { SnackbarProvider, NotificationProvider, AuthContext, AuthContextInterface, AuthProvider } from "@ginger-society/ginger-ui";
import { WorkspaceProvider } from "./components/organisms/WorkspaceSwitcher/WorkspaceContext";
import { ValidateTokenResponse } from "./services/IAMService_client";
import { IAMService } from "./services";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS, GINGER_SOCIETY_NOTIFICATIONSERVICE_WS } from "./shared/references";
import { useContext } from "react";

const rootElement = document.querySelector('[data-js="root"]') as HTMLElement;

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const validateToken = async (): Promise<ValidateTokenResponse> => {
  return IAMService.identityValidateToken();
};

const App = () => {
  const { user } = useContext<AuthContextInterface<ValidateTokenResponse>>(AuthContext);
  return <>
    <AuthProvider<ValidateTokenResponse>

      validateToken={validateToken}
      navigateToLogin={() => {
        window.location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/login?returnUrl=${router.state.location.pathname}`
      }
      }
      postLoginNavigate={() =>
        router.navigate("/manage-workspaces")
      }
    >
      <NotificationProvider url={GINGER_SOCIETY_NOTIFICATIONSERVICE_WS} user={user}>
        <WorkspaceProvider>
          <SnackbarProvider>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </WorkspaceProvider>
      </NotificationProvider>
    </AuthProvider >
  </>
};


const root = createRoot(rootElement);
root.render(
  <App />
);
