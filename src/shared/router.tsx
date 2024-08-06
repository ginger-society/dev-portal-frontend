import { createHashRouter } from "react-router-dom";
import { withAuthHOC } from "./WithAuthHOC";
import Editor from "@/pages/Editor";
import HandleNavigation from "@/pages/HandleAuth";
import { ListViewPage } from "@/pages/ListView";
import { ServicesListViewPage } from "@/pages/ServicesListView";
import { PackagesListViewPage } from "@/pages/PackagesListView";
import { SwaggerViewPage } from "@/pages/SwaggerView";

const AuthenticatedHome = withAuthHOC(Editor);
const AuthenticatedListView = withAuthHOC(ListViewPage);
const AuthenticatedServicesListView = withAuthHOC(ServicesListViewPage);
const AuthenticatedSwaggerViewPage = withAuthHOC(SwaggerViewPage);
const AuthenticatedPackagesListView = withAuthHOC(PackagesListViewPage);

const router = createHashRouter([
  {
    path: "/",
    element: <AuthenticatedListView />,
  },
  {
    path: "/editor/:docId/:branch",
    element: <AuthenticatedHome />,
  },
  {
    path: "/services",
    element: <AuthenticatedServicesListView />,
  },
  {
    path: "/packages",
    element: <AuthenticatedPackagesListView />,
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
