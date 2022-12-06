import { IconButton } from "@mui/material";
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
            <IconButton
              onClick={() => keycloak.logout()}
              sx={{ width: 40, height: 40 }}
            >
              <Iconify icon="eva:log-out-outline" width={20} height={20} />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => keycloak.login()}
              sx={{ width: 40, height: 40 }}
            >
              <Iconify icon="eva:person-outline" width={20} height={20} />
            </IconButton>
          )}
        </>
      ) : null}
    </>
  );
}
