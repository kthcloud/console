import { Link as RouterLink } from "react-router-dom";
import { Box } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useContext } from "react";
import { ThemeModeContext } from "../contexts/ThemeModeContext";

export default function Logo({
  disabledLink = false,
  sx,
}: {
  disabledLink?: boolean;
  sx?: any;
}) {
  const { initialized, keycloak } = useKeycloak();
  const { mode } = useContext(ThemeModeContext);

  // get window.location.hostname

  const logo = (
    <Box component="div" sx={{ width: 140, height: "auto", ...sx }}>
      <img
        src={
          "/static/logo_" +
          (window.location.hostname.includes("cloud.cbh.kth.se")
            ? "cbh"
            : "kth") +
          "_" +
          mode +
          ".svg"
        }
        className="App-logo"
        alt="logo"
      />
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  if (initialized && keycloak.authenticated) {
    return <RouterLink to="/deploy">{logo}</RouterLink>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}
