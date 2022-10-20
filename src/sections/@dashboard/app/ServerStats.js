import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 360;

const LEGEND_HEIGHT = 0;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(2),
  '& .apexcharts-canvas svg': {
    height: CHART_HEIGHT,
  },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

ServerStats.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function ServerStats({ title, subheader, chartData, chartColors, chartLabels, ...other }) {
  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: 2 },
    fill: { opacity: 0.48 },
    legend: { floating: true, horizontalAlign: 'center' },
    xaxis: {
      categories: chartLabels,
      labels: {
        style: {
          colors: chartColors,
        },
      },
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [{
              from: 0,
              to: 10,
              color: '#128FD9',
            },
            {
              from: 10,
              to: 20,
              color: '#09986D',
            },
            {
              from: 20,
              to: 30,
              color: '#00A100',
              name: "high"
            },
            {
              from: 30,
              to: 40,
              color: '#40A600',
            },
            {
              from: 40,
              to: 50,
              color: '#80AA00',
            },
            {
              from: 50,
              to: 60,
              color: '#C0AE00',
            },
            {
              from: 60,
              to: 70,
              color: '#FFB200',
            },
            {
              from: 70,
              to: 80,
              color: '#FF7D21',
            },
            {
              from: 80,
              to: 90,
              color: '#FF6332',
            },
            {
              from: 90,
              to: 110,
              color: '#FF4842',
            },
          ]
        }
      }
    }

  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <ChartWrapperStyle dir="ltr">
        <ReactApexChart type="heatmap" series={chartData} options={chartOptions} height={340} />
      </ChartWrapperStyle>
    </Card>
  );
}
