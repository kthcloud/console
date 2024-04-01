import merge from "lodash/merge";
import ReactApexChart from "react-apexcharts";
// @mui
import { styled } from "@mui/material/styles";
import { Card, CardHeader, CardContent } from "@mui/material";
// components
import { BaseOptionChart } from "../../components/chart";

// ----------------------------------------------------------------------

const CHART_HEIGHT = 360;

const LEGEND_HEIGHT = 0;

const ChartWrapperStyle = styled("div")(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(2),
  "& .apexcharts-canvas svg": {
    height: CHART_HEIGHT,
  },
  "& .apexcharts-canvas svg,.apexcharts-canvas foreignObject": {
    overflow: "visible",
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    alignContent: "center",
    position: "relative !important",
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function LineChart({
  title,
  subheader,
  chartData,
  chartColors,
}) {
  const chartOptions = merge(BaseOptionChart(), {
    plotOptions: { treemap: {} },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: chartColors,
        },
      },
    },
    chart: { animations: { enabled: false } },

    markers: {
      size: 0,
    },

    tooltip: {
      enabled: true,
    },
    dataLabels: {
      enabled: false,
    },

    legend: {
      show: true,
      floating: true,
      horizontalAlign: "right",
      onItemClick: {
        toggleDataSeries: false,
      },
      position: "top",
    },
  });

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardContent>
        <CardHeader title={title} subheader={subheader} />
        <ChartWrapperStyle dir="ltr">
          <ReactApexChart
            type="line"
            series={chartData}
            height="100%"
            width="100%"
            options={chartOptions}
          />
        </ChartWrapperStyle>
      </CardContent>
    </Card>
  );
}
