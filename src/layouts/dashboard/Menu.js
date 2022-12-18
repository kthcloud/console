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

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleOpen}>
        <Iconify icon="eva:menu-outline" width={20} height={20} />
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
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            Beta program
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem
            href={"https://discord.gg/MuHQd6QEtM"}
            component={Link}
            onClick={handleClose}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request an account
          </MenuItem>

          {initialized ? (
            <>
              {keycloak.authenticated ? (
                <MenuItem
                  to={"/deploy"}
                  component={RouterLink}
                  onClick={handleClose}
                >
                  Deploy
                </MenuItem>
              ) : null}
            </>
          ) : null}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* DEV */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            Development
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem
            href={"https://k8s.dev.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Kubernetes
          </MenuItem>
          <MenuItem
            href={"https://proxy.dev.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Proxy
          </MenuItem>
        </Stack>
        <Divider sx={{ borderStyle: "dashed" }} />

        {/* PROD */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            Production
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem
            href={"https://k8s.prod.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Kubernetes
          </MenuItem>
          <MenuItem
            href={"https://proxy.prod.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Proxy
          </MenuItem>
        </Stack>
        <Divider sx={{ borderStyle: "dashed" }} />

        {/* INTERNAL */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            Internal
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem
            href={"https://dashboard.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            href={"https://k8s.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Kubernetes
          </MenuItem>
          <MenuItem
            href={"https://proxy.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            Proxy
          </MenuItem>
          <MenuItem
            href={"https://iam.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            IAM
          </MenuItem>
          <MenuItem
            href={"https://dns.kthcloud.com"}
            component={Link}
            onClick={handleClose}
          >
            DNS
          </MenuItem>
        </Stack>
      </MenuPopover>
    </>
  );
}
