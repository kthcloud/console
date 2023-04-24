import { useLocation } from "react-router-dom";
// @mui
import { useTheme } from "@mui/material/styles";
import { Grid, Container, Typography, Alert, AlertTitle } from "@mui/material";
// components
import Page from "../components/Page";
import useInterval from "../utils/useInterval";
import { useState, useEffect } from "react";
// sections
import {
  TreeMap,
  WidgetSummary,
  ServerStats,
  LineChart,
} from "../sections/status";

// ----------------------------------------------------------------------

export default function Status() {
  const [statusData, setStatusData] = useState([]);
  const [cpuCapacities, setCpuCapacities] = useState([]);
  const [ramCapacities, setRamCapacities] = useState([]);
  const [gpuCapacities, setGpuCapacities] = useState([]);
  const [overviewData, _setOverviewData] = useState([]);
  const location = useLocation();

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
        name: "CPU Temp",
        data: cpuTemp,
      },
      {
        name: "CPU Load",
        data: cpuLoad,
      },
      {
        name: "RAM Load",
        data: ramLoad,
      },
      {
        name: "GPU Temp",
        data: gpuTemp,
      },
    ]);
  };

  const getStatusData = () => {
    fetch(process.env.REACT_APP_API_URL + "/landing/v2/status?n=100", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((result) => {
        let statusData = result[0].status.hosts.map((host) => {
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
        });

        setStatusData(statusData);
        setCpuCapacities(
          result[0].status.hosts.map((host) => {
            return {
              x: host.name,
              y: host.cpu.load.cores.length,
            };
          })
        );
        setOverviewData(result);
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
    fetch(process.env.REACT_APP_API_URL + "/landing/v2/stats?n=1", {
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

  useEffect(() => {
    getStats();
  }, []);

  // Capacities
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

        setRamCapacities(
          result[0].capacities.hosts.map((host) => {
            return {
              x: host.name,
              y: host.ram.total,
            };
          })
        );

        setGpuCapacities(
          result[0].capacities.hosts.map((host) => {
            return {
              x: host.name,
              y: host.gpu ? host.gpu.count : 0,
            };
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    getCapacities();
  }, []);

  useInterval(() => {
    getCapacities();
  }, 1000);

  const theme = useTheme();

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        {location.search.includes("sotl") && (
          <Alert severity="info" sx={{ mb: 5 }} elevation={3}>
            <AlertTitle>KTH SoTL 2023</AlertTitle>
            SoTL participants: Join us in room D33 for demo sessions as 13:45
            and 15:15. Interested in the project?{" "}
            <a href="https://discord.gg/MuHQd6QEtM">Request an account.</a>
          </Alert>
        )}
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
              title="CPU cores"
              total={cpuCores}
              color="warning"
              icon={"uil:processor"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Terabytes of memory"
              total={ram}
              color="success"
              icon={"bi:memory"}
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

          <Grid item xs={12} md={6} lg={8}>
            <LineChart
              title="Overview"
              chartData={overviewData}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title="CPU capacity"
              chartData={cpuCapacities}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title="RAM capacity"
              chartData={ramCapacities}
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TreeMap
              title="GPU capacity"
              chartData={gpuCapacities}
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
