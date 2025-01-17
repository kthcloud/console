import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "./LoadingPage";
import { useContext } from "react";
import { AuthContextWrapper } from "../contexts/AuthContextWrapper";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { error } = useContext(AuthContextWrapper);
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
