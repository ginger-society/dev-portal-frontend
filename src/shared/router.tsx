import { createHashRouter } from "react-router-dom";
import { withAuthHOC } from "./WithAuthHOC";
import Editor from "@/pages/Editor";
import { Login } from "@/pages/Login";
import { DocumentsList } from "@/pages/ListView";

const AuthenticatedHome = withAuthHOC(Editor);
const AuthenticatedListView = withAuthHOC(DocumentsList);

const router = createHashRouter([
  {
    path: "/",
    element: <AuthenticatedListView />,
  },
  {
    path: "/editor/:docId/:docName",
    element: <AuthenticatedHome />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
