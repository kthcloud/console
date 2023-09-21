import { IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
import HelpButton from "./HelpButton";
// ----------------------------------------------------------------------

export default function Shortcuts() {
  const { keycloak, initialized } = useKeycloak();

  return (
    <>
      <HelpButton />

      {initialized && keycloak.authenticated && (
        <>
          <Tooltip title="Dashboard">
            <IconButton
              component={Link}
              to="/deploy"
              sx={{
                width: 40,
                height: 40,
                display: {
                  xs: "none",
                  sm: "none",
                  md: "inline-flex",
                },
              }}
            >
              <Iconify icon="material-symbols:cloud" width={20} height={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Create new">
            <IconButton
              component={Link}
              to="/create"
              sx={{
                width: 40,
                height: 40,
                display: {
                  xs: "none",
                  sm: "none",
                  md: "inline-flex",
                },
              }}
            >
              <Iconify
                icon="material-symbols:add-circle-outline-rounded"
                width={20}
                height={20}
                title="Create"
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton
              component={Link}
              to="/profile"
              sx={{
                width: 40,
                height: 40,
                display: {
                  xs: "none",
                  sm: "none",
                  md: "inline-flex",
                },
              }}
            >
              <Iconify
                icon="mdi:user-circle"
                width={20}
                height={20}
                title="Profile"
              />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
}
