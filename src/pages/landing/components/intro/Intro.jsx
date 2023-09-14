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
import { useKeycloak } from "@react-keycloak/web";

const Intro = () => {
  const { keycloak, initialized } = useKeycloak();

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
                Welcome to <strong>kthcloud</strong>
              </Typography>

              <Typography variant="subtitle1" sx={{ marginBottom: "40px" }}>
                We offer a cutting-edge private cloud infrastructure tailored to
                meet the unique needs of KTH's bright minds. Seamlessly run
                experiments, collaborate on groundbreaking research, and harness
                the power of cloud technology to drive innovation.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle2" sx={{ marginBottom: "40px" }}>
                  Register today free of charge - all you need is a KTH account.
                </Typography>

                <Button
                  variant="contained"
                  sx={{ whiteSpace: "nowrap", px: 4 }}
                  onClick={() => {
                    if (!initialized) return;
                    keycloak.login({
                      redirectUri: window.location.origin + "/deploy",
                    });
                  }}
                >
                  Get started
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
