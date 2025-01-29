// keycloak
import { AuthContextWrapperProvider } from "./contexts/AuthContextWrapper";
import { keycloak } from "./keycloak";
// routes
import Router from "./Router";
// theme
import ThemeProvider from "./theme";
// components
import ScrollToTop from "./components/ScrollToTop";
import { BaseOptionChartStyle } from "./components/chart/BaseOptionChart";
import { ResourceContextProvider } from "./contexts/ResourceContext";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import Iconify from "./components/Iconify";
import { ThemeModeContextProvider } from "./contexts/ThemeModeContext";
import { AlertContextProvider } from "./contexts/AlertContext";
import { AdminResourceContextProvider } from "./contexts/AdminResourceContext";

export default function App() {
  return (
    <AuthContextWrapperProvider authClient={keycloak}>
      <AlertContextProvider>
        <ResourceContextProvider>
          <AdminResourceContextProvider>
            <ThemeModeContextProvider>
              <SnackbarProvider
                maxSnack={5}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                autoHideDuration={3000}
                action={(snack) => (
                  <IconButton
                    onClick={() => closeSnackbar(snack)}
                    color="inherit"
                  >
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
            </ThemeModeContextProvider>
          </AdminResourceContextProvider>
        </ResourceContextProvider>
      </AlertContextProvider>
    </AuthContextWrapperProvider>
  );
}
