import { useRef, useState } from "react";
// keycloak
import { useKeycloak } from "@react-keycloak/web";
// @mui
import {
  Box,
  Divider,
  Typography,
  Stack,
  MenuItem,
  IconButton,
} from "@mui/material";
import MenuPopover from "../../components/MenuPopover";
import Iconify from "../../components/Iconify";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useResource from "src/hooks/useResource";

// ----------------------------------------------------------------------

export default function Menu() {
  const anchorRef = useRef(null);
  const { t } = useTranslation();

  const [open, setOpen] = useState(null);

  const { unread } = useResource();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const { keycloak, initialized } = useKeycloak();

  const shouldRenderAdmin = () => {
    if (!initialized) return false;
    if (!keycloak) return false;
    if (!keycloak.authenticated) return false;

    keycloak.loadUserInfo();

    if (!keycloak.userInfo) return false;

    if (!Object.hasOwn(keycloak.userInfo, "groups")) return false;
    return keycloak.userInfo.groups.includes("admin");
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        aria-label={t("menu-label")}
      >
        <Iconify icon="material-symbols:menu-rounded" width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          "& .MuiMenuItem-root": {
            typography: "body2",
            borderRadius: 0.75,
          },
        }}
      >
        {initialized && (
          <>
            {keycloak.authenticated && (
              <>
                <Box sx={{ mt: 1.5, px: 2.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                    noWrap
                  >
                    {t("menu-manage-resources")}
                  </Typography>
                </Box>

                <Stack sx={{ p: 1 }}>
                  <MenuItem
                    to={"/deploy"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("menu-dashboard")}
                  </MenuItem>
                  <MenuItem
                    to={"/create"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("menu-create-new")}
                  </MenuItem>
                </Stack>

                <Divider sx={{ borderStyle: "dashed" }} />

                <Box sx={{ mt: 1.5, px: 2.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                    noWrap
                  >
                    {t("menu-manage-account")}
                  </Typography>
                </Box>
                <Stack sx={{ p: 1 }}>
                  <MenuItem
                    to={"/profile"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("menu-profile")}
                  </MenuItem>
                  <MenuItem
                    to={"/inbox"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("inbox") + " " + (unread > 0 ? "(" + unread + ")" : "")}
                  </MenuItem>
                  <MenuItem
                    to={"/teams"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("teams")}
                  </MenuItem>
                  <MenuItem
                    to={"/tiers"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    {t("menu-tiers")}
                  </MenuItem>
                </Stack>
                <Divider sx={{ borderStyle: "dashed" }} />
              </>
            )}
          </>
        )}

        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {t("menu-cbhcloud")}
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem to={"/status"} component={RouterLink} onClick={handleClose}>
            {t("menu-status")}
          </MenuItem>
          <MenuItem
            href={"https://wiki.cloud.cbh.kth.se/"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            {t("menu-wiki")}
          </MenuItem>
          <MenuItem
            href={"https://discord.gg/MuHQd6QEtM"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("menu-support")}
          </MenuItem>
          <MenuItem
            href={"https://mastodon.social/@kthcloud"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            {t("menu-mastodon")}
          </MenuItem>
          <MenuItem
            href={"https://github.com/kthcloud"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            {t("menu-github")}
          </MenuItem>
        </Stack>

        {shouldRenderAdmin() && (
          <>
            <Divider sx={{ borderStyle: "dashed" }} />

            <Box sx={{ mt: 1.5, px: 2.5 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
                noWrap
              >
                {t("menu-admin")}
              </Typography>
            </Box>

            <Stack sx={{ p: 1 }}>
              <MenuItem href={"/admin"} component={Link} onClick={handleClose}>
                {t("menu-admin-panel")}
              </MenuItem>
              <MenuItem
                href={"https://dashboard.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                {t("menu-cloudstack")}
              </MenuItem>
              <MenuItem
                href={"https://rancher.mgmt.cloud.cbh.kth.se/"}
                component={Link}
                onClick={handleClose}
              >
                {t("menu-rancher")}
              </MenuItem>
              <MenuItem
                href={"https://iam.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                {t("menu-keycloak")}
              </MenuItem>
              <MenuItem
                href={"https://dns.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                {t("menu-dns")}
              </MenuItem>
            </Stack>
          </>
        )}
      </MenuPopover>
    </>
  );
}
