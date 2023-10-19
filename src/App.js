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
import { SnackbarProvider, closeSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import Iconify from "./components/Iconify";
// ----------------------------------------------------------------------

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <ResourceContextProvider>
        <SnackbarProvider
          maxSnack={5}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          action={(snack) => (
            <IconButton onClick={() => closeSnackbar(snack)} color="inherit">
              <Iconify icon="material-symbols:close" />
            </IconButton>
          )}
          dense
          preventDuplicate
        >
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
