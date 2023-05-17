import { IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
// ----------------------------------------------------------------------

export default function LoginButton() {
  const { keycloak, initialized } = useKeycloak();

  return (
    <>
      {initialized ? (
        <>
          {keycloak.authenticated ? (
            <Tooltip title="Log out">
              <IconButton
                onClick={() => keycloak.logout()}
                sx={{ width: 40, height: 40 }}
              >
                <Iconify icon="eva:log-out-outline" width={20} height={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Log in">
              <IconButton
                onClick={() => keycloak.login()}
                sx={{ width: 40, height: 40 }}
              >
                <Iconify icon="eva:log-in-outline" width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : null}
    </>
  );
}
