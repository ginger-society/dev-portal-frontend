import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./app.css";
import "../node_modules/@gingersociety/ginger-ui/dist/esm/index.css";
import "../node_modules/@ginger-society/ginger-ui-uml/dist/esm/index.css";



import router from "./shared/router";
import { SnackbarProvider, NotificationProvider, AuthContext, AuthContextInterface, AuthProvider, PermissionProvider } from "@gingersociety/ginger-ui";
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

const checkPermission = async (groupId: string) => {
  const data = await IAMService.identityIsMember({ groupParam: groupId })
  return { isAdmin: data.isOwner, isMember: data.isMember }
}

const App = () => {
  const { user } = useContext<AuthContextInterface<ValidateTokenResponse>>(AuthContext);

  return <>
    {/* TODO: remove the user prop after testing as its marked optional in the latest release of ginger UI */}
    <NotificationProvider url={GINGER_SOCIETY_NOTIFICATIONSERVICE_WS()} channelPrefix={`dev_portal`} user={user}>
      <PermissionProvider checkPermission={checkPermission}>
        <WorkspaceProvider>
          <SnackbarProvider>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </WorkspaceProvider>
      </PermissionProvider>
    </NotificationProvider>
  </>
};

const fetchConfig = async () => {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) throw new Error(`Failed to fetch config: ${response.statusText}`);
    (window as any).CONFIG = await response.json();
  } catch (error) {
    console.error("Error fetching config:", error);
    (window as any).CONFIG = {};
  }
}

const init = async () => {
  await fetchConfig();

  const root = createRoot(rootElement);
  root.render(
    <AuthProvider<ValidateTokenResponse>
      validateToken={validateToken}
      navigateToLogin={() =>
        window.location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS()}#dev-portal-staging/login?returnUrl=${router.state.location.pathname}`
      }
      postLoginNavigate={() =>
        router.navigate("/manage-workspaces")
      }
    >
      <App />
    </AuthProvider>
  );
};

init();
