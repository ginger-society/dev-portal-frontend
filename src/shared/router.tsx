import { createHashRouter } from "react-router-dom";
import { withAuthHOC } from "./WithAuthHOC";
import Editor from "@/pages/Editor";
import { Login } from "@/pages/Login";
import { DocumentsList } from "@/pages/ListView";
import HandleNavigation from "@/pages/HandleAuth";

const AuthenticatedHome = withAuthHOC(Editor);
const AuthenticatedListView = withAuthHOC(DocumentsList);

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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/handle-auth/:access_token/:refresh_token",
    element: <HandleNavigation />,
  },
]);

export default router;
