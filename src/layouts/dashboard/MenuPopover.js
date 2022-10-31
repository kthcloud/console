import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// keycloak
import { useKeycloak } from '@react-keycloak/web';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
// mocks_
import account from '../../_mock/account';
import Iconify from '../../components/Iconify';
import Link from '@mui/material/Link';
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
    linkTo: '/',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    linkTo: '#',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    linkTo: '#',
  },
];

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

  const { keycloak } = useKeycloak()

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          // ...(open && {
          //   '&:before': {
          //     zIndex: 1,
          //     content: "''",
          //     width: '100%',
          //     height: '100%',
          //     borderRadius: '50%',
          //     position: 'absolute',
          //     bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
          //   },
          // }),
        }}
      >
        {/* <Avatar src={account.photoURL} alt="photoURL" /> */}
        <Iconify icon="eva:menu-outline" width={20} height={20} />
      </IconButton>

      {/* 
      <IconButton
        ref={anchorRef}
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButton> */}

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        {/* <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            Navigation
          </Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} /> */}

        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Account
          </Typography>
        </Box>
        <Stack sx={{ p: 1 }}>
          <MenuItem component={Link} onClick={() => {
            keycloak.login()
            handleClose()
          }}>
            Log in
          </MenuItem>
          <MenuItem href={"/404"} component={Link} onClick={handleClose}>
            Request an account
          </MenuItem>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* DEV */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Production
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem href={"https://k8s.dev.kthcloud.com"} component={Link} onClick={handleClose}>
            Kubernetes
          </MenuItem>
          <MenuItem href={"https://proxy.dev.kthcloud.com"} component={Link} onClick={handleClose}>
            Proxy
          </MenuItem>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* PROD */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Production
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem href={"https://k8s.prod.kthcloud.com"} component={Link} onClick={handleClose}>
            Kubernetes
          </MenuItem>
          <MenuItem href={"https://proxy.prod.kthcloud.com"} component={Link} onClick={handleClose}>
            Proxy
          </MenuItem>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* INTERNAL */}
        <Box sx={{ mt: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Internal
          </Typography>
        </Box>

        <Stack sx={{ p: 1 }}>
          <MenuItem href={"https://dashboard.kthcloud.com"} component={Link} onClick={handleClose}>
            Dashboard
          </MenuItem>
          <MenuItem href={"https://k8s.kthcloud.com"} component={Link} onClick={handleClose}>
            Kubernetes
          </MenuItem>
          <MenuItem href={"https://proxy.kthcloud.com"} component={Link} onClick={handleClose}>
            Proxy
          </MenuItem>
          <MenuItem href={"https://iam.kthcloud.com"} component={Link} onClick={handleClose}>
            IAM
          </MenuItem>
          <MenuItem href={"https://dns.kthcloud.com"} component={Link} onClick={handleClose}>
            DNS
          </MenuItem>
        </Stack>
      </MenuPopover>
    </>
  );
}
