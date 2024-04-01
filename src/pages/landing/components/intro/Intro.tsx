import {
  Grid,
  Card,
  Container,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import "./intro.css";
import { Cloud } from "./Cloud";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Intro = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Container maxWidth="lg">
        <Card sx={{ boxShadow: 20, background: "#1b2842", color: "#ffffff" }}>
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "block",
              },
            }}
          >
            <Cloud position={[-3, 0, 0]} />
          </Box>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            rowSpacing={4}
            sx={{
              padding: {
                xs: "50px 16px",
                sm: "50px 58px",
                md: "50px 50px 50px 50px",
              },
            }}
          >
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  display: {
                    xs: "block",
                    sm: "block",
                    md: "none",
                  },
                  padding: 0,
                }}
              >
                <Cloud mobile position={[0, 0, 0]} />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "400",
                  marginBottom: "40px",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                {t("landing-intro-header")} <strong>kthcloud</strong>
              </Typography>

              <Typography variant="subtitle1" sx={{ marginBottom: "40px" }}>
                {t("landing-intro-body")}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle2" sx={{ marginBottom: "40px" }}>
                  {t("landing-intro-footer")}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ whiteSpace: "nowrap", px: 4 }}
                  component={Link}
                  to="/tiers"
                >
                  {t("button-get-started")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};

export default Intro;
