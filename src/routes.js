import { Navigate, useRoutes } from "react-router-dom";
// layouts
import DashboardLayout from "./layouts/dashboard";
import LogoOnlyLayout from "./layouts/LogoOnlyLayout";
//
import Edit from "./pages/edit";
import Deploy from "./pages/deploy";
import Profile from "./pages/profile";
import Create from "./pages/create";

import NotFound from "./pages/404";
import Status from "./pages/status";
import ProtectedRoute from "./components/ProtectedRoute";

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Status /> },
        {
          path: "deploy",
          element: (
            <ProtectedRoute>
              <Deploy />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "edit/:type/:id",
          element: (
            <ProtectedRoute>
              <Edit />
            </ProtectedRoute>
          ),
        },
        {
          path: "create",
          element: (
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          ),
        },
      ],
    },
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
