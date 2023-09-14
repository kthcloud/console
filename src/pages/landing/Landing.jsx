import Hero from "./components/hero/Hero";
import Jeremy from "./components/intro/Intro";
import Page from "../../components/Page";
import { Box } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "src/components/LoadingPage";

export function Landing() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Page>
        <Box sx={{ minHeight: "100vh" }}></Box>
      </Page>
    );
  } else if (initialized && keycloak.authenticated) {
    window.location.href = "/deploy";
    return <LoadingPage />;
  } else {
    return (
      <Page>
        <Box mt={5}></Box>
        <Hero />
        <Jeremy />
      </Page>
    );
  }
}
