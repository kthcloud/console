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

// ----------------------------------------------------------------------

export default function Menu() {
  const anchorRef = useRef(null);

  const [open, setOpen] = useState(null);

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
    return keycloak.userInfo.groups.includes("/admin");
  };

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleOpen}>
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
                    Manage
                  </Typography>
                </Box>

                <Stack sx={{ p: 1 }}>
                  <MenuItem
                    to={"/deploy"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    Deploy
                  </MenuItem>
                  <MenuItem
                    to={"/create"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    Create new
                  </MenuItem>

                  <MenuItem
                    to={"/profile"}
                    component={RouterLink}
                    onClick={handleClose}
                  >
                    Profile
                  </MenuItem>
                </Stack>
                <Divider sx={{ borderStyle: "dashed" }} />
              </>
            )}
          </>
        )}

        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            kthcloud
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem to={"/"} component={RouterLink} onClick={handleClose}>
            Status
          </MenuItem>
          <MenuItem
            href={"https://discord.gg/MuHQd6QEtM"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request account
          </MenuItem>
          <MenuItem
            href={"https://mastodon.social/@kthcloud"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="me"
          >
            Mastodon
          </MenuItem>
        </Stack>

        {shouldRenderAdmin() && (
          <>
            <Divider sx={{ borderStyle: "dashed" }} />

            {/* DEV */}
            <Box sx={{ mt: 1.5, px: 2.5 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
                noWrap
              >
                Development
              </Typography>
            </Box>

            <Stack sx={{ p: 1 }}>
              <MenuItem
                href={"https://k8s.dev.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Kubernetes
              </MenuItem>
              <MenuItem
                href={"https://proxy.dev.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Proxy
              </MenuItem>
            </Stack>
            <Divider sx={{ borderStyle: "dashed" }} />

            {/* PROD */}
            <Box sx={{ mt: 1.5, px: 2.5 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
                noWrap
              >
                Production
              </Typography>
            </Box>

            <Stack sx={{ p: 1 }}>
              <MenuItem
                href={"https://k8s.prod.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Kubernetes
              </MenuItem>
              <MenuItem
                href={"https://proxy.prod.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Proxy
              </MenuItem>
            </Stack>
            <Divider sx={{ borderStyle: "dashed" }} />

            {/* INTERNAL */}
            <Box sx={{ mt: 1.5, px: 2.5 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
                noWrap
              >
                Internal
              </Typography>
            </Box>

            <Stack sx={{ p: 1 }}>
              <MenuItem
                href={"https://dashboard.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                href={"https://k8s.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Kubernetes
              </MenuItem>
              <MenuItem
                href={"https://proxy.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                Proxy
              </MenuItem>
              <MenuItem
                href={"https://iam.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                IAM
              </MenuItem>
              <MenuItem
                href={"https://dns.cloud.cbh.kth.se"}
                component={Link}
                onClick={handleClose}
              >
                DNS
              </MenuItem>
            </Stack>
          </>
        )}
      </MenuPopover>
    </>
  );
}
