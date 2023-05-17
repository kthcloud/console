import { IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
// ----------------------------------------------------------------------

export default function Shortcuts() {
  const { keycloak, initialized } = useKeycloak();

  return (
    <>
      {initialized && keycloak.authenticated && (
        <>
          <Tooltip title="Deploy">
            <IconButton
              component={Link}
              to="/deploy"
              sx={{ width: 40, height: 40 }}
            >
              <Iconify
                icon="material-symbols:cloud-upload"
                width={20}
                height={20}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Create new">
            <IconButton
              component={Link}
              to="/create"
              sx={{ width: 40, height: 40 }}
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
              sx={{ width: 40, height: 40 }}
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
