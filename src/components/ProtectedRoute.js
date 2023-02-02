import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const ProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  return initialized && keycloak.authenticated ? (
    children
  ) : (
    <Navigate to="/" replace={true} />
  );
};

export default ProtectedRoute;
