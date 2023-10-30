import { Link as RouterLink } from "react-router-dom";
// @mui
import { styled } from "@mui/material/styles";
import { Button, Typography, Container, Box } from "@mui/material";
// components
import Page from "../components/Page";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Page404() {
  const { t } = useTranslation();

  return (
    <Page title={t("404-title")}>
      <Container>
        <ContentStyle sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="h3" paragraph>
            {t("page-not-found")}
          </Typography>

          <Typography sx={{ color: "text.secondary" }}>
            {t("page-not-found-subheader")}
          </Typography>

          <Box
            component="img"
            src="/static/illustrations/illustration_404.svg"
            sx={{ height: 260, mx: "auto", my: { xs: 5, sm: 10 } }}
          />

          <Button
            to="/"
            size="large"
            variant="contained"
            component={RouterLink}
          >
            {t("take-me-back")}
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
