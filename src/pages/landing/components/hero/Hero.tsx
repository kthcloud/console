import {
  Container,
  Grid,
  CardMedia,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import "./hero.css";
import { useEffect, useState } from "react";
import { fShortenNumber } from "../../../../utils/formatNumber";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { TimestampedSystemCapacities } from "@kthcloud/go-deploy-types/types/v2/body";

const Hero = () => {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

  // Capacities
  const [capacitiesLoading, setCapacitiesLoading] = useState(true);
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const getCapacities = () => {
    fetch(import.meta.env.VITE_DEPLOY_API_URL + "/systemCapacities?n=1", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result: TimestampedSystemCapacities[]) => {
        setRam(result[0].capacities.ram.total);
        setCpuCores(result[0].capacities.cpuCore.total);
        setGpus(result[0].capacities.gpu.total);

        setCapacitiesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching capacities:", error);
      });
  };
  useEffect(() => {
    getCapacities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="lg" sx={{ marginBottom: { xs: "100px" } }}>
      <Grid container>
        <Grid
          item
          md={10}
          sm={12}
          xs={12}
          sx={{
            marginBottom: { xs: "50px", sm: "100px", md: "50px" },
            padding: { md: "80px 0", sm: "20px 0" },
            backgroundImage: {
              xs: "none",
              sm: `url(${"/static/landing/hero-portrait.webp"})`,
            },
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: { sm: "400px", md: "404px" },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "38px", sm: "56px", md: "72px" },
              pr: 5,
            }}
          >
            {t("landing-intro-header") +
              " " +
              (window.location.hostname.includes("cbh")
                ? "cbhcloud"
                : "kthcloud")}
          </Typography>
          <div className="hero-p">
            <Typography variant="body1" sx={{ fontSize: "1.4rem" }}>
              {t("landing-intro-subheader")}
            </Typography>
          </div>
          <Stack
            direction="row"
            spacing={2}
            sx={{ marginTop: "40px" }}
            useFlexGap
          >
            <Button
              variant={"contained"}
              size={"large"}
              component={Link}
              to="/tiers"
            >
              {t("button-get-started")}
            </Button>
            <Button
              variant={"outlined"}
              size={"large"}
              onClick={() => {
                if (!initialized) return;
                keycloak.login({
                  redirectUri: window.location.origin + "/deploy",
                });
              }}
            >
              {t("button-login")}
            </Button>
          </Stack>
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
          sx={{ display: { sm: "none" }, marginBottom: "56px" }}
        >
          <CardMedia
            component="img"
            src={"/static/landing/hero-landscape.webp"}
            alt="hero phone"
          />
        </Grid>

        <Grid
          rowSpacing={4}
          item
          container
          md={1.5}
          xs={12}
          justifyContent="center"
          alignItems="center"
          sx={{
            padding: { md: "100px 0" },
            opacity: capacitiesLoading ? 0 : 1,
          }}
        >
          <Grid item xs={12} sm={4} md={12}>
            <Typography
              variant="h2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {fShortenNumber(gpus)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {t("landing-hero-gpu")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} md={12}>
            <Typography
              variant="h2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {fShortenNumber(cpuCores)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {t("landing-hero-cpu")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} md={12}>
            <Typography
              variant="h2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {fShortenNumber(Math.round(ram / 1000))}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: { md: "left", xs: "center" } }}
            >
              {t("landing-hero-ram")}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Hero;
