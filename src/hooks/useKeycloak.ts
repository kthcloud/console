import { useAuth } from "react-oidc-context";

type KeycloakLike = {
  authenticated: boolean;
  token?: string;
  tokenParsed?: Record<string, any>;
  subject?: string;
  logout: () => Promise<void>;
  login: () => Promise<void>;
};

export const useKeycloak = () => {
  const auth = useAuth();

  const keycloak: KeycloakLike = {
    authenticated: auth.isAuthenticated,
    token: auth.user?.access_token,
    tokenParsed: auth.user?.profile,
    subject: auth.user?.profile?.sub,
    login: () => auth.signinRedirect(),
    logout: () => auth.removeUser(),
  };

  return {
    initialized: !auth.isLoading,
    keycloak,
  };
};
