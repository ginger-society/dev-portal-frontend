import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./app.css";
import "../node_modules/@ginger-society/ginger-ui/dist/esm/index.css";

import { AuthProvider } from "./shared/AuthContext";
import router from "./shared/router";
import { SnackbarProvider } from "@ginger-society/ginger-ui";
import { WorkspaceProvider } from "./components/organisms/WorkspaceSwitcher/WorkspaceContext";
import { NotificationProvider } from "./shared/NotificationContext";
import { ValidateTokenResponse } from "./services/IAMService_client";
import { IAMService } from "./services";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "./shared/references";

const rootElement = document.querySelector('[data-js="root"]') as HTMLElement;

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const validateToken = async (): Promise<ValidateTokenResponse> => {
  return IAMService.identityValidateToken();
};


const root = createRoot(rootElement);
root.render(
  <AuthProvider<ValidateTokenResponse>
    
      validateToken={validateToken}
      navigateToLogin={() =>
        window.location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/login`
      }
      postLoginNavigate={() =>
        router.navigate("/manage-workspaces")
      }
    >
    <NotificationProvider>
      <WorkspaceProvider>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </WorkspaceProvider>
    </NotificationProvider>
  </AuthProvider>
);
