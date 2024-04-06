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
import { GenAITooltip } from "../../../../components/GenAITooltip";
import { Link } from "react-router-dom";

const Hero = () => {
  const { keycloak, initialized } = useKeycloak();
  const { t, i18n } = useTranslation();

  // Capacities
  const [capacitiesLoading, setCapacitiesLoading] = useState(true);
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const getCapacities = () => {
    fetch(import.meta.env.VITE_API_URL + "/landing/v2/capacities?n=1", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
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

  // Header
  const [headerLoading, setHeaderLoading] = useState(true);
  const [header, setHeader] = useState("Welcome to kthcloud");
  const [subheader, setSubheader] = useState(
    "Start deploying your projects today"
  );

  const getHeaderGenerated = async () => {
    try {
      let res = await fetch(
        "https://llama-prefetch.app.cloud.cbh.kth.se/query"
      );

      let content = await res.json();

      if (content.header) {
        setHeader(content.header);
      }
      if (content.sub) {
        setSubheader(content.sub);
      }
    } catch (_) {
    } finally {
      setHeaderLoading(false);
    }
  };
  useEffect(() => {
    getHeaderGenerated();
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
              opacity: headerLoading ? 0 : 1,
            }}
            pr={5}
            opacity={headerLoading ? 0 : 1}
          >
            {i18n.language !== "en" ? (
              t("onboarding-welcome")
            ) : (
              <GenAITooltip>{header}</GenAITooltip>
            )}
          </Typography>
          <div className="hero-p">
            <Typography
              variant="body"
              sx={{ fontSize: "1.4rem", opacity: headerLoading ? 0 : 1 }}
            >
              {i18n.language !== "en" ? (
                t("landing-intro-subheader")
              ) : (
                <GenAITooltip>{subheader}</GenAITooltip>
              )}
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
