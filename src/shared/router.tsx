import { createHashRouter } from "react-router-dom";
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
import { SystemThemePreferred, withAuthHOC } from '@gingersociety/ginger-ui';
import ExampleComponent from "@/pages/ExamplePage";
import Genesis from "@/pages/Genesis/Genesis";
import DifferPage from "@/pages/differ";

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

const AuthenticatedGenesisPage = withAuthHOC(
  Genesis
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
    element: <SystemThemePreferred><SysDesignViewPublic /></SystemThemePreferred>,
  },
  {
    path: "/public/services/swagger/:org_id/:service_identifier/:env_id",
    element: <SystemThemePreferred><SwaggerViewPagePublic /></SystemThemePreferred>,
  },
  {
    path: "/public/editor/:docId/:branch",
    element: <SystemThemePreferred><EditorPublic /></SystemThemePreferred>,
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
    path: "/genesis/:org_id/:template_id",
    element: <SystemThemePreferred><AuthenticatedGenesisPage /></SystemThemePreferred>,
  },
  {
    path: "/differ/:org_id/:branch_name",
    element: <SystemThemePreferred><DifferPage /></SystemThemePreferred>,
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
