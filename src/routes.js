import { Navigate, useRoutes } from "react-router-dom";
// layouts
import DashboardLayout from "./layouts/dashboard";
import LogoOnlyLayout from "./layouts/LogoOnlyLayout";
//
import Deploy from "./pages/Deploy";
import NotFound from "./pages/Page404";
import Status from "./pages/Status";

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Status /> },
        { path: "deploy", element: <Deploy /> },
        // { path: "products", element: <Products /> },
        // { path: "blog", element: <Blog /> },
      ],
    },
    // {
    //   path: "login",
    //   element: <Login />,
    // },
    // {
    //   path: "register",
    //   element: <Register />,
    // },
    {
      path: "/",
      element: <LogoOnlyLayout />,
      children: [
        { path: "404", element: <NotFound /> },
        { path: "*", element: <Navigate to="/404" /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);
}
