import { IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
import HelpButton from "./HelpButton";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslation } from "react-i18next";
import ProfileButton from "./ProfileButton";

export default function Shortcuts() {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

  return (
    <>
      <HelpButton />
      <LocaleSwitcher />

      {initialized && keycloak.authenticated && (
        <>
          <Tooltip enterTouchDelay={10} title={t("menu-dashboard")}>
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

          <Tooltip enterTouchDelay={10} title={t("menu-create-new")}>
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

          <ProfileButton />
        </>
      )}
    </>
  );
}
