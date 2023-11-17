import Hero from "./components/hero/Hero";
import Intro from "./components/intro/Intro";
import Page from "../../components/Page";
import { Box, Typography } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "src/components/LoadingPage";
import Iconify from "src/components/Iconify";
import { useTranslation } from "react-i18next";

export function Landing() {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

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
        <Intro />
        <Typography variant="body2" align="center" mt={5}>
          <Iconify icon="twemoji:sparkles" />{" "}
          {t("this-content-is-ai-generated")}
        </Typography>
      </Page>
    );
  }
}
