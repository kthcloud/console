import Hero from "./components/hero/Hero";
import Intro from "./components/intro/Intro";
import Page from "../../components/Page";
import { Box } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "../../components/LoadingPage";
import { useTranslation } from "react-i18next";
import Funding from "./components/funding/Funding";

export function Landing() {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

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
        <Box component="div" sx={{ mt: 5 }}></Box>
        <Hero />
        <Intro />
        <Funding />
      </Page>
    );
  }
}
