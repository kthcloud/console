// @mui
import { useTheme } from "@mui/material/styles";
import { Grid, Container, Typography } from "@mui/material";
// components
import Page from "../components/Page";
import useInterval from "../utils/useInterval";
import { useState, useEffect } from "react";
// sections
import {
  AppNewsUpdate,
  AppWidgetSummary,
  ServerStats,
} from "../sections/@dashboard/app";
import AlertPopup from "src/components/AlertPopup";

// ----------------------------------------------------------------------

export default function Status() {
  // Status
  const [statusData, setStatusData] = useState([
    { name: "loading", data: [0] },
  ]);

  const getStatusData = () => {
    fetch("https://api.landing.kthcloud.com/status", {
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
    fetch("https://api.landing.kthcloud.com/stats", {
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
    fetch("https://api.landing.kthcloud.com/capacities", {
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
  });

  // News
  const [newsData, _setNewsData] = useState([]);

  const setNewsData = (news) => {
    let sorted = news.sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
    _setNewsData(sorted);
  };

  const getNewsData = () => {
    fetch("https://api.landing.kthcloud.com/news", {
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
  }, 1000000);

  const theme = useTheme();

  return (
    <Page title="Dashboard">
      <Grid container justifyContent="flex-end">
        <AlertPopup />
      </Grid>

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
            <AppWidgetSummary
              title="Running containers"
              total={podCount}
              icon={"octicon:container-16"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="GPUs"
              total={gpus}
              color="secondary"
              icon={"bi:gpu-card"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="CPU Cores"
              total={cpuCores}
              color="warning"
              icon={"uil:processor"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Gigabytes of memory"
              total={ram}
              color="success"
              icon={"bi:memory"}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="News"
              list={newsData}
              onCreate={(news) => setNewsData((current) => [...current, news])}
              onDelete={(id) =>
                setNewsData((current) => current.filter((e) => e.id !== id))
              }
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <ServerStats
              title="Server statistics"
              chartLabels={["CPU °C", "CPU %", "Memory %", "GPU °C"]}
              chartData={
                statusData
                //   [
                //   { name: 'se-flem-001', data: [80, 50, 30, 50, 30] },
                //   { name: 'se-flem-002', data: [80, 50, 30, 50, 30] },
                //   { name: 'se-flem-003', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-004', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-005', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-006', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-007', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-008', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-009', data: [44, 76, 78, 56, 56] },
                //   { name: 'se-flem-010', data: [44, 76, 78, 56, 56] },
                // ]
              }
              chartColors={[...Array(6)].map(
                () => theme.palette.text.secondary
              )}
            />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="TBD component"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="TBD Component"
              subheader="something something this is how to create an account"
              chartLabels={[
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ]}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ]}
            />
          </Grid> */}

          {/* 
          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} height={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} height={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} height={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} height={32} />,
                },
              ]}
            />
          </Grid> */}
          {/* 
          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Current Visits"
              chartData={[
                { label: 'America', value: 4344 },
                { label: 'Asia', value: 5435 },
                { label: 'Europe', value: 1443 },
                { label: 'Africa', value: 4443 },
              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.chart.blue[0],
                theme.palette.chart.violet[0],
                theme.palette.chart.yellow[0],
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={[
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ]}
            />
          </Grid> */}
        </Grid>
      </Container>
    </Page>
  );
}
