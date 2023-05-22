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
import { ResourceContextProvider } from "./contexts/ResourceContext";
import { SnackbarProvider } from "notistack";
// ----------------------------------------------------------------------

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <ResourceContextProvider>
        <SnackbarProvider maxSnack={10}>
          <ThemeProvider>
            <ScrollToTop />
            <BaseOptionChartStyle />
            <Router />
          </ThemeProvider>
        </SnackbarProvider>
      </ResourceContextProvider>
    </ReactKeycloakProvider>
  );
}
