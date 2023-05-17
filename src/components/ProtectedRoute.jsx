import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "./LoadingPage";

const ProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  const renderPage = (children) => {
    if (!initialized) {
      return (
       <LoadingPage/>
      );
    } else if (initialized && keycloak.authenticated) {
      return children;
    } else {
      return <Navigate to="/" replace={true} />;
    }
  };

  return renderPage(children);
};

export default ProtectedRoute;
