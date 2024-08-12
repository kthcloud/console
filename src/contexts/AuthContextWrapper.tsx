// keycloak
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";

import {
  AuthClientEvent,
  AuthClientError,
} from "@react-keycloak/core/lib/types";
import { createContext, useState } from "react";

type AuthContextWrapperType = {
  events: AuthClientEvent[];
  error?: AuthClientError;
};

const initialState: AuthContextWrapperType = {
  events: [],
};

export const AuthContextWrapper = createContext(initialState);

export const AuthContextWrapperProvider = ({
  authClient,
  children,
}: {
  authClient: Keycloak;
  children: React.ReactNode;
}) => {
  const [events, setEvents] = useState<AuthClientEvent[]>([]);
  const [error, setError] = useState<AuthClientError | undefined>(undefined);

  const handleEvent = (
    event: AuthClientEvent,
    error: AuthClientError | undefined
  ) => {
    setEvents([...events, event]);
    if (error) {
      setError(error);
    }
  };
  return (
    <AuthContextWrapper.Provider value={{ events, error }}>
      <ReactKeycloakProvider authClient={authClient} onEvent={handleEvent}>
        {children}
      </ReactKeycloakProvider>
    </AuthContextWrapper.Provider>
  );
};
