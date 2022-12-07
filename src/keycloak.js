import Keycloak from "keycloak-js";

const config = {
  url: "https://iam.kthcloud.com",
  realm: "cloud",
  clientId: "landing",
};

const keycloak = new Keycloak(config);

export { keycloak };
