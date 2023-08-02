import { Outlet } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
//
import Navbar from "./Navbar";
import { Container } from "@mui/material";

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up("lg")]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  return (
    <RootStyle>
      <Navbar />
      <MainStyle>
        <Outlet />
        <Container sx={{opacity: 0.5, textAlign: "center", padding:"2rem"}} >
          <p><span style={{opacity: 0.75}}>kthcloud/landing-frontend</span> {process.env.REACT_APP_RELEASE_NAME}</p>
        </Container>
      </MainStyle>
    </RootStyle>
  );
}
