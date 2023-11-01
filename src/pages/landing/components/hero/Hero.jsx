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
import { fShortenNumber } from "src/utils/formatNumber";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import { GenAITooltip } from "src/components/GenAITooltip";

const Hero = () => {
  const { keycloak, initialized } = useKeycloak();
  const { t } = useTranslation();

  // Capacities
  const [capacitiesLoading, setCapacitiesLoading] = useState(true);
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const getCapacities = () => {
    fetch(process.env.REACT_APP_API_URL + "/landing/v2/capacities?n=1", {
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
  const [header, setHeader] = useState("Welcome to cbhcloud");
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
              sm: `url(${
                process.env.PUBLIC_URL + "/static/landing/hero-portrait.webp"
              })`,
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
            <GenAITooltip>{header}</GenAITooltip>
          </Typography>
          <div className="hero-p">
            <Typography
              variant="body"
              sx={{ fontSize: "1.4rem", opacity: headerLoading ? 0 : 1 }}
            >
              <GenAITooltip>{subheader}</GenAITooltip>
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
              onClick={() => {
                if (!initialized) return;
                keycloak.login({
                  redirectUri: window.location.origin + "/deploy",
                });
              }}
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
            src={process.env.PUBLIC_URL + "/static/landing/hero-landscape.webp"}
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
              {(ram / 1000).toString().substring(0, 3)}
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
