import Hero from "./components/hero/Hero";
import Intro from "./components/intro/Intro";
import Page from "../../components/Page";
import { Box, Container } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "../../components/LoadingPage";
import Funding from "./components/funding/Funding";
import { AlertList } from "../../components/AlertList";

export function Landing() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Page>
        <Box component="div" sx={{ minHeight: "100vh" }}></Box>
      </Page>
    );
  } else if (initialized && keycloak.authenticated) {
    window.location.href = "/deploy";
    return <LoadingPage />;
  } else {
    return (
      <Page>
        <Container maxWidth="lg" sx={{ pb: 2 }}>
          <AlertList />
        </Container>

        <Hero />
        <Intro />
        <Funding />
      </Page>
    );
  }
}
