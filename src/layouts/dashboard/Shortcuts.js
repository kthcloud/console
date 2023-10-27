import { Avatar, IconButton, Tooltip } from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
import HelpButton from "./HelpButton";
import LocaleSwitcher from "./LocaleSwitcher";
import useResource from "src/hooks/useResource";
import { useEffect, useState } from "react";
import { MD5 } from "crypto-js";
import { useTranslation } from "react-i18next";
// ----------------------------------------------------------------------

export default function Shortcuts() {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();
  const { user } = useResource();
  const [userAvatar, setUserAvatar] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const gravatar = async () => {
    const cleaned = user.email.trim().toLowerCase();
    const hash = MD5(cleaned, { encoding: "binary" }).toString();

    const uri = encodeURI(`https://www.gravatar.com/avatar/${hash}?d=404`);

    const response = await fetch(uri);
    if (response.status === 200) {
      return uri;
    }
    return null;
  };

  const fetchProfilePic = async () => {
    const gravatarUri = await gravatar();
    setHasFetched(true);
    if (gravatarUri) {
      setUserAvatar(gravatarUri);
      return;
    }
  };

  useEffect(() => {
    if (!(user && user.email && !hasFetched)) return;
    fetchProfilePic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <HelpButton />
      <LocaleSwitcher />

      {initialized && keycloak.authenticated && (
        <>
          <Tooltip title={t("menu-dashboard")}>
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

          <Tooltip title={t("menu-create-new")}>
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

          <Tooltip title={t("menu-profile")}>
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
              {user && userAvatar ? (
                <Avatar sx={{ width: 20, height: 20 }} src={userAvatar} />
              ) : (
                <Iconify icon="mdi:user-circle" title="Profile" />
              )}
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
}
