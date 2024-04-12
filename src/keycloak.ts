import Keycloak from "keycloak-js";

const config = {
  url: "https://iam.cloud.cbh.kth.se",
  realm: "cloud",
  clientId: "landing",
};

const keycloak = new Keycloak(config);

export { keycloak };
