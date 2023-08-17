// mui
import { useTheme } from "@mui/material/styles";
import { Grid, Container, Typography } from "@mui/material";

// components
import Page from "../../components/Page";
import useInterval from "../../hooks/useInterval";
import { useState, useEffect } from "react";

// sections
import TreeMap from "./TreeMap";
import WidgetSummary from "./WidgetSummary";
import ServerStats from "./ServerStats";
import LineChart from "./LineChart";

// ----------------------------------------------------------------------

export function Status() {
  const [statusData, setStatusData] = useState([]);
  const [cpuCapacities, setCpuCapacities] = useState([]);
  const [ramCapacities, setRamCapacities] = useState([]);
  const [gpuCapacities, setGpuCapacities] = useState([]);
  const [overviewData, _setOverviewData] = useState([]);
  const [statusLock, setStatusLock] = useState(false);
  const [capacitiesLock, setCapacitiesLock] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [header, setHeader] = useState("Welcome to cbhcloud");
  const [subheader, setSubheader] = useState(
    "Start deploying your projects today"
  );

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
    if (statusLock) return;
    setStatusLock(true);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getStats, []);

  // Capacities
  const [ram, setRam] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [gpus, setGpus] = useState(0);

  const getCapacities = () => {
    if (capacitiesLock) return;
    setCapacitiesLock(true);
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
        setCapacitiesLock(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getHeaderGenerated = async () => {
    let body = JSON.stringify({
      prompt:
        'This is a conversation between user and llama, a friendly chatbot. respond in simple markdown.\n\nUser: Write a new header and subheader for our website, kthcloud. It is a cloud computing service for students and researchers at KTH, the royal institute of technology in stockholm, sweden. Keep it short - one sentence long. Return as a JSON with the header as the "header" and "sub" objects. \n\n\nllama: {"header": "Welcome to kthcloud", "sub": "Start deploying your projects today"}\n\nUser: Another one?\n\n\nllama:',
      frequency_penalty: 0,
      n_predict: 400,
      presence_penalty: 0,
      repeat_last_n: 256,
      repeat_penalty: 1.18,
      stop: ["</s>", "llama:", "User:"],
      temperature: 0.7,
      tfs_z: 1,
      top_k: 40,
      top_p: 0.5,
      typical_p: 1,
    });

    try {
      let res = await fetch("https://llama.app.cloud.cbh.kth.se/completion", {
        method: "POST",
        body: body,
      });

      let data = await res.json();

      let content = JSON.parse(data.content);

      if (content.header) {
        setHeader(fixCase(content.header));
      }
      if (content.sub) {
        setSubheader(fixCase(content.sub));
      }

    } catch (_) {
    } finally {
      setHeaderLoading(false);
    }
  };

  const fixCase = (str) => {
    let low_str = str.toLowerCase();
    let index = low_str.indexOf("kthcloud");
    if (index === -1) {
      return str;
    }
    return str.substring(0, index) + "kthcloud" + str.substring(index + 8);
  };

  useEffect(() => {
    getCapacities();
    getHeaderGenerated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => {
    getCapacities();
  }, 1000);

  const theme = useTheme();

  return (
    <Page title="Status">
      <Container maxWidth="xl">
        {headerLoading ? (
          <Typography variant="h4" sx={{ opacity: 0 }}>
            Welcome to cbhcloud
          </Typography>
        ) : (
          <Typography variant="h4">{header}</Typography>
        )}

        {headerLoading ? (
          <Typography
            variant="h5"
            sx={{ mb: 5, fontWeight: "normal", opacity: 0 }}
          >
            Start deploying your projects today
          </Typography>
        ) : (
          <Typography
            variant="h5"
            sx={{ mb: 5, opacity: 0.5, fontWeight: "normal" }}
          >
            {subheader}
          </Typography>
        )}

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
