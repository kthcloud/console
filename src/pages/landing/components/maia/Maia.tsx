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
import { Brain } from "./Brain";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Maia = () => {
  const { t } = useTranslation();

  return (
    <Box component="div" sx={{ overflow: "hidden", marginTop: 5 }}>
      <Container maxWidth="lg">
        <Card sx={{ boxShadow: 20, background: "#242424ff", color: "#ffffff" }}>
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
            {/* Text block - comes first on all screen sizes */}
            <Grid
              item
              sx={{ zIndex: 6 }}
              xs={12}
              md={5}
              order={{ xs: 1, md: 1 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "400",
                  marginBottom: "40px",
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                {t("maia-intro-header")} <strong>MAIA</strong>
              </Typography>

              <Typography variant="subtitle1" sx={{ marginBottom: "40px" }}>
                {t("maia-intro-body")}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle2" sx={{ marginBottom: "40px" }}>
                  {t("maia-intro-footer")}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ whiteSpace: "nowrap", px: 8 }}
                  component={Link}
                  to={import.meta.env.VITE_MAIA_URL}
                >
                  {t("button-get-started-maia")}
                </Button>
              </Stack>
            </Grid>

            {/* Brain block - comes second on desktop, second (below) on mobile */}
            <Grid item xs={12} md={7} order={{ xs: 2, md: 2 }}>
              {/* Desktop brain */}
              <Box
                component="div"
                sx={{
                  display: { xs: "none", sm: "none", md: "block" },
                  textAlign: "right",
                  zIndex: 1,
                }}
              >
                <Brain position={[3, 0, 0]} mobile={false} />
              </Box>

              {/* Mobile brain */}
              <Box
                component="div"
                sx={{
                  display: { xs: "block", sm: "block", md: "none" },
                  padding: 0,
                  textAlign: "center",
                }}
              >
                <Brain mobile position={[0, 0, 0]} />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};

export default Maia;
