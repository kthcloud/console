import { Navigate, useRoutes } from "react-router-dom";
// layouts
import DashboardLayout from "./layouts/dashboard";
import LogoOnlyLayout from "./layouts/LogoOnlyLayout";
//
import Edit from "./pages/edit";
import Deploy from "./pages/deploy";
import Profile from "./pages/profile";
import Create from "./pages/create";
import Landing from "./pages/landing";
import Admin from "./pages/admin";
import Tiers from "./pages/tiers/Tiers";

import NotFound from "./pages/404";
import Status from "./pages/status";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/onboarding";
import Inbox from "./pages/inbox/Inbox";
import Teams from "./pages/teams/Teams";
import { GPU } from "./pages/gpu/GPU";

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Landing /> },
        { path: "/status", element: <Status /> },
        { path: "tiers", element: <Tiers /> },
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
          path: "inbox",
          element: (
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          ),
        },
        {
          path: "teams",
          element: (
            <ProtectedRoute>
              <Teams />
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
          path: "gpu",
          element: (
            <ProtectedRoute>
              <GPU />
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
        {
          path: "onboarding",
          element: (
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <ProtectedRoute>
              <Admin />
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
