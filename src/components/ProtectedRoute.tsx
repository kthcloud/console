import { Navigate } from "react-router-dom";
import { useKeycloak } from "../hooks/useKeycloak";
import LoadingPage from "./LoadingPage";
import { useAuth } from "react-oidc-context";
//import { AuthContextWrapper } from "../contexts/AuthContextWrapper";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { error } = useAuth();
  const { keycloak, initialized } = useKeycloak();

  const renderPage = (children: React.ReactNode) => {
    if (!initialized && !error) {
      return <LoadingPage />;
    } else if (initialized && keycloak.authenticated) {
      return children;
    } else {
      return <Navigate to="/" replace={true} />;
    }
  };

  return renderPage(children);
};

export default ProtectedRoute;
