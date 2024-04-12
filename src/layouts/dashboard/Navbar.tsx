import { alpha, styled } from "@mui/material/styles";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuPopover from "./Menu";
import LoginButton from "./LoginButton";
import Logo from "../../components/Logo";
import Shortcuts from "./Shortcuts";

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

export default function Navbar() {
  const theme = useTheme();
  const greaterThan = useMediaQuery(theme.breakpoints.up("lg"));
  const smallerThan = useMediaQuery(theme.breakpoints.down("sm"));

  const renderContainer = (children: React.ReactNode) => {
    if (greaterThan || smallerThan) {
      return <Container maxWidth="xl">{children}</Container>;
    } else {
      return children;
    }
  };

  return (
    <RootStyle>
      {renderContainer(
        <ToolbarStyle sx={{ px: 0 }}>
          <Box component="div" sx={{ px: 0, py: 3, display: "inline-flex" }}>
            <Logo />
          </Box>
          <Box component="div" sx={{ flexGrow: 1 }} />

          <Box component="div" sx={{ pl: 0, py: 3, display: "inline-flex" }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1.5 }}
            >
              <Shortcuts />
              <LoginButton />
              <MenuPopover />
            </Stack>
          </Box>
        </ToolbarStyle>
      )}
    </RootStyle>
  );
}
