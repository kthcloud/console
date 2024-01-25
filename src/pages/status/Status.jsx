// mui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Container,
  Typography,
  CardHeader,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

// components
import Page from "../../components/Page";
import useInterval from "../../hooks/useInterval";
import { useState, useEffect } from "react";

// sections
import TreeMap from "./TreeMap";
import WidgetSummary from "./WidgetSummary";
import ServerStats from "./ServerStats";
import LineChart from "./LineChart";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

export function Status() {
  const { t } = useTranslation();

  const [statusData, setStatusData] = useState([]);
  const [cpuCapacities, setCpuCapacities] = useState([]);
  const [ramCapacities, setRamCapacities] = useState([]);
  const [gpuCapacities, setGpuCapacities] = useState([]);
  const [overviewData, _setOverviewData] = useState([]);
  const [statusLock, setStatusLock] = useState(false);
  const [capacitiesLock, setCapacitiesLock] = useState(false);
  const [posts, setPosts] = useState([]);

  // Capacities
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const setOverviewData = (data) => {
    let cpuTemp = [];
    let cpuLoad = [];
    let ramLoad = [];
    let gpuTemp = [];

    data.forEach((element) => {
      let averageCpuTemp =
        element.status.hosts
          .map((host) => {
            return host.cpu.temp.main;
          })
          .reduce((a, b) => a + b, 0) / element.status.hosts.length;
      let averageCpuLoad =
        element.status.hosts
          .map((host) => {
            return host.cpu.load.main;
          })
          .reduce((a, b) => a + b, 0) / element.status.hosts.length;
      let averageRamLoad =
        element.status.hosts
          .map((host) => {
            return host.ram.load.main;
          })
          .reduce((a, b) => a + b, 0) / element.status.hosts.length;
      let averageGpuTemp =
        element.status.hosts
          .map((host) => {
            return host.gpu ? host.gpu.temp[0].main : 0;
          })
          .reduce((a, b) => a + b, 0) / element.status.hosts.length;

      cpuTemp.push({
        x: element.timestamp,
        y: Math.floor(averageCpuTemp),
      });
      cpuLoad.push({
        x: element.timestamp,
        y: Math.floor(averageCpuLoad),
      });
      ramLoad.push({
        x: element.timestamp,
        y: Math.floor(averageRamLoad),
      });
      gpuTemp.push({
        x: element.timestamp,
        y: Math.floor(averageGpuTemp),
      });
    });

    _setOverviewData([
      {
        name: "CPU °C",
        data: cpuTemp,
      },
      {
        name: "CPU %",
        data: cpuLoad,
      },
      {
        name: "RAM %",
        data: ramLoad,
      },
      {
        name: "GPU °C",
        data: gpuTemp,
      },
    ]);
  };

  const getStatusData = () => {
    if (statusLock) return;
    setStatusLock(true);
    fetch(import.meta.env.VITE_API_URL + "/landing/v2/status?n=100", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        let statusData = result[0].status.hosts.map((host) => {
          const gpuTemp = host.gpu ? host.gpu.temp[0].main : null;
          return {
            name: host.displayName,
            data: [
              host.cpu.temp.main,
              host.cpu.load.main,
              host.ram.load.main,
              gpuTemp,
            ],
          };
        });

        setStatusData(statusData);
        setCpuCapacities(
          result[0].status.hosts.map((host) => {
            return {
              x: host.displayName,
              y: host.cpu.load.cores.length,
            };
          })
        );
        setOverviewData(result);
        setStatusLock(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useInterval(() => {
    getStatusData();
  }, 1000);

  // Stats
  const [podCount, setPodCount] = useState(0);

  const getStats = () => {
    fetch(import.meta.env.VITE_API_URL + "/landing/v2/stats?n=1", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setPodCount(result[0].stats.k8s.podCount);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getCapacities = () => {
    if (capacitiesLock) return;
    setCapacitiesLock(true);
    fetch(import.meta.env.VITE_API_URL + "/landing/v2/capacities?n=1", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setRam(result[0].capacities.ram.total);
        setCpuCores(result[0].capacities.cpuCore.total);
        setGpus(result[0].capacities.gpu.total);

        setRamCapacities(
          result[0].capacities.hosts.map((host) => {
            return {
              x: host.displayName,
              y: host.ram.total,
            };
          })
        );

        setGpuCapacities(
          result[0].capacities.hosts.map((host) => {
            return {
              x: host.displayName,
              y: host.gpu ? host.gpu.count : 0,
            };
          })
        );
        setCapacitiesLock(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getMastodonPosts = async () => {
    try {
      let res = await fetch(
        "https://mastodon.social/api/v1/accounts/110213092906619761/statuses"
      );
      let posts = await res.json();
      setPosts(posts.slice(0, 3));
    } catch (_) {}
  };

  useEffect(() => {
    getMastodonPosts();
    getCapacities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getStats, []);

  const theme = useTheme();

  return (
    <Page title={t("menu-status")}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom mb={5}>
          {t("menu-status")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title={t("running-containers")}
              total={podCount}
              icon={"octicon:container-16"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title={t("resource-gpus")}
              total={gpus}
              color="secondary"
              icon={"bi:gpu-card"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title={t("landing-hero-cpu")}
              total={cpuCores}
              color="warning"
              icon={"uil:processor"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title={t("landing-hero-ram")}
              total={ram}
              color="success"
              icon={"bi:memory"}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <ServerStats
              title={t("server-statistics")}
              chartLabels={["CPU °C", "CPU %", "Memory %", "GPU °C"]}
              chartData={statusData}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <LineChart
              title={t("overview")}
              chartData={overviewData}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title={t("cpu-capacity")}
              chartData={cpuCapacities}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title={t("ram-capacity")}
              chartData={ramCapacities}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title={t("gpu-capacity")}
              chartData={gpuCapacities}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          {posts.length > 0 && (
            <Grid item xs={12} md={12} lg={12}>
              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("latest-posts-on-mastodon")} />
                <CardContent>
                  <Stack
                    spacing={2}
                    direction={"row"}
                    alignItems={"center"}
                    useFlexGap
                    flexWrap="wrap"
                    justifyContent={"space-evenly"}
                    sm={{ direction: "column" }}
                  >
                    {posts.map((post) => (
                      <iframe
                        key={post.id}
                        title="Mastodon"
                        style={{
                          width: "30%",
                          height: 500,
                          border: 0,
                          borderRadius: 4,
                          minWidth: 300,
                        }}
                        src={
                          "https://mastodon.social/@kthcloud/" +
                          post.id +
                          "/embed"
                        }
                        className="mastodon-embed"
                        allowFullScreen
                      ></iframe>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <script src="https://mastodon.social/embed.js" async="async"></script>
      </Container>
    </Page>
  );
}
