import { IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";

export default function LoginButton() {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

  return (
    <>
      {initialized ? (
        <>
          {keycloak.authenticated ? (
            <Tooltip enterTouchDelay={10} title={t("button-logout")}>
              <IconButton
                onClick={() => keycloak.logout()}
                sx={{ width: 40, height: 40 }}
              >
                <Iconify icon="eva:log-out-outline" width={20} height={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip enterTouchDelay={10} title={t("button-login")}>
              <IconButton
                onClick={() =>
                  keycloak.login({
                    redirectUri: window.location.origin + "/deploy",
                  })
                }
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
