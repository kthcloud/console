import { useContext, useState } from "react";
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
import useResource from "../../hooks/useResource";
import { ThemeModeContext } from "../../contexts/ThemeModeContext";

export default function Menu() {
  const { t } = useTranslation();

  const { mode, toggleMode } = useContext(ThemeModeContext);

  const [open, setOpen] = useState<EventTarget | null>(null);

  const { unread, user } = useResource();

  const handleOpen = (event: any) => {
    if (event.currentTarget) setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const shouldRenderAdmin = () => {
    if (!user) return false;
    if (!user.admin) return false;

    return true;
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
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
          overflowY: "auto",
        }}
      >
        {user && (
          <>
            <Box component="div" sx={{ mt: 1.5, px: 2.5 }}>
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
                to={"/gpu"}
                component={RouterLink}
                onClick={handleClose}
              >
                {t("gpu-leases")}
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

            <Box component="div" sx={{ mt: 1.5, px: 2.5 }}>
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

        <Box component="div" sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {t("menu-kthcloud")}
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem to={"/status"} component={RouterLink} onClick={handleClose}>
            {t("menu-status")}
          </MenuItem>
          <MenuItem
            href={"https://maia.cloud.cbh.kth.se/"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            {t("menu-maia")}
          </MenuItem>
          <MenuItem
            href={"https://docs.cloud.cbh.kth.se/"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            {t("menu-docs")}
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
        <Divider sx={{ borderStyle: "dashed" }} />

        <Box component="div" sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {t("theme")}
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem
            onClick={() => {
              toggleMode();
              handleClose();
            }}
          >
            {t(mode !== "dark" ? "dark-mode" : "light-mode")}
          </MenuItem>
        </Stack>
        {shouldRenderAdmin() && (
          <>
            <Divider sx={{ borderStyle: "dashed" }} />

            <Box component="div" sx={{ mt: 1.5, px: 2.5 }}>
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
