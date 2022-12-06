import PropTypes from "prop-types";
// material
import { alpha, styled } from "@mui/material/styles";
import { Box, Container, AppBar, Toolbar, Stack } from "@mui/material";
// components
import MenuPopover from "./MenuPopover";
import LoginButton from "./LoginButton";
import Logo from "../../components/Logo";

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 0;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up("lg")]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
  },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up("lg")]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 0),
    // padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};

export default function DashboardNavbar({ onOpenSidebar }) {
  return (
    <RootStyle>
      {/* Remove this container if the logo should be out by the viewport edge */}
      <Container maxWidth="xl">
        <ToolbarStyle sx={{ px: 0 }}>
          <Box sx={{ px: 0, py: 3, display: "inline-flex" }}>
            <Logo />
          </Box>
          {/* <IconButton
            onClick={onOpenSidebar}
            sx={{ mr: 1, color: "text.primary", display: { lg: "none" } }}
          >
            <Iconify icon="eva:menu-2-fill" />
          </IconButton> */}

          {/* <Searchbar /> */}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ pl: 0, py: 3, display: "inline-flex" }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1.5 }}
            >
              {/* <LanguagePopover /> */}
              <LoginButton />
              <MenuPopover />
            </Stack>
          </Box>
        </ToolbarStyle>
      </Container>
    </RootStyle>
  );
}
