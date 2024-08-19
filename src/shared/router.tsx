import { createHashRouter } from "react-router-dom";
import { withAuthHOC } from "./WithAuthHOC";
import Editor from "@/pages/Editor";
import HandleNavigation from "@/pages/HandleAuth";
import { SwaggerViewPage } from "@/pages/SwaggerView";
import { SysDesignView } from "@/pages/SysDesignView";

const AuthenticatedHome = withAuthHOC(Editor);
const AuthenticatedSwaggerViewPage = withAuthHOC(SwaggerViewPage);
const AuthenticatedSysDesignView = withAuthHOC(SysDesignView);

const router = createHashRouter([
  {
    path: "/:env",
    element: <AuthenticatedSysDesignView />,
  },
  {
    path: "/editor/:docId/:branch",
    element: <AuthenticatedHome />,
  },
  {
    path: "/services/swagger/:org_id/:service_identifier/:env_id",
    element: <AuthenticatedSwaggerViewPage />,
  },
  {
    path: "/handle-auth/:access_token/:refresh_token",
    element: <HandleNavigation />,
  },
]);

export default router;
