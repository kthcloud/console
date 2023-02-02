// @mui
import { useTheme } from "@mui/material/styles";
import { Grid, Container, Typography } from "@mui/material";
// components
import Page from "../components/Page";
import useInterval from "../utils/useInterval";
import { useState, useEffect } from "react";
// sections
import { NewsUpdate, WidgetSummary, ServerStats } from "../sections/status";

// ----------------------------------------------------------------------

export default function Status() {
  const [statusData, setStatusData] = useState([]); // { name: "", data: [] }

  const getStatusData = () => {
    fetch(process.env.REACT_APP_API_URL + "/landing/v1/status", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setStatusData(
          result.hosts.map((host) => {
            const gpuTemp = host.gpu ? host.gpu.temp[0].main : null;
            return {
              name: host.name,
              data: [
                host.cpu.temp.main,
                host.cpu.load.main,
                host.ram.load.main,
                gpuTemp,
              ],
            };
          })
        );
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
    fetch(process.env.REACT_APP_API_URL + "/landing/v1/stats", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setPodCount(result.k8s.podCount);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useInterval(() => {
    getStats();
  }, 1000);

  // Capacities
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const getCapacities = () => {
    fetch(process.env.REACT_APP_API_URL + "/landing/v1/capacities", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        setRam(result.ram.total);
        setCpuCores(result.cpuCore.total);
        setGpus(result.gpu.total);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    getCapacities();
  }, []);

  // News
  const [newsData, _setNewsData] = useState([]);

  const setNewsData = (news) => {
    let sorted = news.sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
    _setNewsData(sorted);
  };

  const getNewsData = () => {
    fetch(process.env.REACT_APP_API_URL + "/landing/v1/news", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        result = result.map((e) => {
          e.content = e.description;
          e.description = undefined;
          return e;
        });
        setNewsData(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useInterval(() => {
    getNewsData();
  }, 1000);

  const theme = useTheme();

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{}}>
          Welcome to kthcloud
        </Typography>

        <Typography
          variant="h5"
          sx={{ mb: 5, opacity: 0.5, fontWeight: "normal" }}
        >
          Start deploying your projects today
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Running containers"
              total={podCount}
              icon={"octicon:container-16"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="GPUs"
              total={gpus}
              color="secondary"
              icon={"bi:gpu-card"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="CPU Cores"
              total={cpuCores}
              color="warning"
              icon={"uil:processor"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Gigabytes of memory"
              total={ram}
              color="success"
              icon={"bi:memory"}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <NewsUpdate
              title="News"
              list={newsData}
              onCreate={(news) => setNewsData([...newsData, news])}
              onDelete={(id) =>
                setNewsData(newsData.filter((e) => e.id !== id))
              }
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <ServerStats
              title="Server statistics"
              chartLabels={["CPU °C", "CPU %", "Memory %", "GPU °C"]}
              chartData={statusData}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
