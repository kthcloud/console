// keycloak
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from "./keycloak";
// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";
// components
import ScrollToTop from "./components/ScrollToTop";
import { BaseOptionChartStyle } from "./components/chart/BaseOptionChart";
import { AlertProvider } from "./contexts/AlertContext";
import { ResourceContextProvider } from "./contexts/ResourceContext";

// ----------------------------------------------------------------------

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <ResourceContextProvider>
        <AlertProvider>
          <ThemeProvider>
            <ScrollToTop />
            <BaseOptionChartStyle />
            <Router />
          </ThemeProvider>
        </AlertProvider>
      </ResourceContextProvider>
    </ReactKeycloakProvider>
  );
}
