import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useState } from "react";

import Iconify from "src/components/Iconify";

const ResourceComparisonTable = () => {
  const useCases = [
    {
      type: "Stateless frontend service: eg. React, AngularJS",
      use: ["deployment"],
    },
    {
      type: "Stateless backend service: eg. Express.js, Flask",
      use: ["deployment"],
    },
    {
      type: "Machine learning GPU compute: eg. TensorFlow, JupyterLab",
      use: ["vm"],
    },
    {
      type: "Game streaming server: eg. Steam Remote Play, Parsec",
      use: ["vm"],
    },
    {
      type: "Databases: eg. MySQL, MongoDB",
      use: ["vm"],
    },
    {
      type: "Real-time analytics: eg. Apache Kafka, Elasticsearch",
      use: ["vm"],
    },
    {
      type: "Cache services: eg. Redis, Memcached",
      use: ["vm", "deployment"],
    },
    {
      type: "Data processing pipelines: eg. Apache Hadoop, Spark",
      use: ["vm"],
    },
    {
      type: "Image processing services: eg. Pillow, OpenCV",
      use: ["vm"],
    },
    {
      type: "Media streaming services: eg. Plex, Emby",
      use: ["vm"],
    },
    {
      type: "Serverless computing services: eg. Cloudflare workerd",
      use: ["deployment"],
    },
    {
      type: "IoT data collection and processing: eg. MQTT, Node-RED",
      use: ["vm"],
    },
    {
      type: "Microservice-based applications: eg. Spring Boot, Django",
      use: ["deployment"],
    },
    {
      type: "Continuous integration and delivery pipelines: eg. Jenkins, GitLab Runner",
      use: ["vm"],
    },
    {
      type: "Batch jobs for data transformation: eg. Talend, Informatica PowerCenter",
      use: ["vm"],
    },
    {
      type: "Web scraping services: eg. Scrapy, Beautiful Soup",
      use: ["vm"],
    },
    {
      type: "Logging services: eg. Logstash, Sentry",
      use: ["deployment"],
    },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Typography variant="body2">
        <b>Kubernetes Deployment</b>
        <br />
        Used for stateless <u>frontend</u> and <u>backend</u> services. Allows
        for CI/CD through GitHub Actions.
      </Typography>

      <Typography variant="body2">
        <b>VM (Virtual Machine)</b>
        <br />
        Provides the ability to run an operating system directly. More versatile
        but deployment and maintenance will be more difficult. Ideal for{" "}
        <u>GPU compute</u> and <u>databases</u>, anything that requires{" "}
        <u>persistent storage</u>.
      </Typography>

      <Stack spacing={3} direction="row">
        <Button
          variant="outlined"
          onClick={() => setDialogOpen(true)}
          endIcon={
            <Iconify
              icon="material-symbols:compare-arrows"
              width={24}
              height={24}
            />
          }
        >
          See example use cases
        </Button>
      </Stack>

      <Dialog
        fullWidth
        maxWidth={"md"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Use case</TableCell>
                  <TableCell>Kubernetes Deployment</TableCell>
                  <TableCell>Virtual Machine</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {useCases.map((row, index) => (
                  <TableRow key={"row" + index}>
                    <TableCell component="th" scope="row">
                      {row.type}
                    </TableCell>
                    <TableCell>
                      {row.use.includes("deployment") && (
                        <Iconify
                          icon="material-symbols:check-small-rounded"
                          width={24}
                          height={24}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {row.use.includes("vm") && (
                        <Iconify
                          icon="material-symbols:check-small-rounded"
                          width={24}
                          height={24}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResourceComparisonTable;
