const oidcConfig = {
  authority:
    import.meta.env.VITE_KEYCLOAK_URL +
    "/realms/" +
    import.meta.env.VITE_KEYCLOAK_REALM,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin + "/oauth2/callback",
  response_type: "code",
  scope: "openid profile email",
};

export { oidcConfig };
