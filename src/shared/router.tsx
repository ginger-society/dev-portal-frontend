import { createHashRouter } from "react-router-dom";
import { withAuthHOC } from "./WithAuthHOC";
import { Editor, EditorPublic } from "@/pages/Editor";
import HandleNavigation from "@/pages/HandleAuth";
import { SwaggerViewPage, SwaggerViewPagePublic } from "@/pages/SwaggerView";
import { SysDesignView, SysDesignViewPublic } from "@/pages/SysDesignView";
import ManageWorkspacePage from "@/pages/ManageWorkspaceView";
import {
  WorkspaceSettingsTokensPage,
  WorkspaceSettingsMembersPage,
  WorkspaceSettingsDeletePage,
} from "@/pages/WorkspaceSettingsView";

import ExampleComponent from "@/pages/ExamplePage";

const AuthenticatedEditor = withAuthHOC(Editor);
const AuthenticatedSwaggerViewPage = withAuthHOC(SwaggerViewPage);
const AuthenticatedSysDesignView = withAuthHOC(SysDesignView);
const AuthenticatedManageWorkspacesView = withAuthHOC(ManageWorkspacePage);
const AuthenticatedWorkspaceSettingsTokensView = withAuthHOC(
  WorkspaceSettingsTokensPage
);

const AuthenticatedWorkspaceSettingsMembersPage = withAuthHOC(
  WorkspaceSettingsMembersPage
);

const AuthenticatedWorkspaceSettingsDeletePage = withAuthHOC(
  WorkspaceSettingsDeletePage
);

const router = createHashRouter([
  {
    path: "/:org_id/:env",
    element: <AuthenticatedSysDesignView />,
  },
  {
    path: "/services/swagger/:org_id/:service_identifier/:env_id",
    element: <AuthenticatedSwaggerViewPage />,
  },
  {
    path: "/editor/:docId/:branch",
    element: <AuthenticatedEditor />,
  },
  {
    path: "/public/:org_id/:env",
    element: <SysDesignViewPublic />,
  },
  {
    path: "/public/services/swagger/:org_id/:service_identifier/:env_id",
    element: <SwaggerViewPagePublic />,
  },
  {
    path: "/public/editor/:docId/:branch",
    element: <EditorPublic />,
  },
  {
    path: "/manage-workspaces",
    element: <AuthenticatedManageWorkspacesView />,
  },
  {
    path: "/manage-workspaces/:org_id/tokens",
    element: <AuthenticatedWorkspaceSettingsTokensView />,
  },
  {
    path: "/manage-workspaces/:org_id/members",
    element: <AuthenticatedWorkspaceSettingsMembersPage />,
  },
  {
    path: "/manage-workspaces/:org_id/delete",
    element: <AuthenticatedWorkspaceSettingsDeletePage />,
  },
  {
    path: "/handle-auth/:access_token/:refresh_token",
    element: <HandleNavigation />,
  },
  {
    path: "/example",
    element: <ExampleComponent />,
  },
]);

export default router;
