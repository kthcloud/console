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
} from "@mui/material";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import Iconify from "src/components/Iconify";

const ResourceComparisonTable = () => {
  const { t } = useTranslation();

  const useCases = [
    {
      type: t("resouce-comparison-stateless-frontend"),
      use: ["deployment"],
    },
    {
      type: t("resouce-comparison-stateless-backend"),
      use: ["deployment"],
    },
    {
      type: t("resouce-comparison-machine-learning-gpu"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-game-streaming-server"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-databases"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-real-time-analytics"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-cache-services"),
      use: ["vm", "deployment"],
    },
    {
      type: t("resouce-comparison-data-processing-pipelines"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-image-processing-services"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-media-streaming-services"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-serverless-computing-services"),
      use: ["deployment"],
    },
    {
      type: t("resouce-comparison-iot-data-collection"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-microservice-based-applications"),
      use: ["deployment"],
    },
    {
      type: t("resouce-comparison-ci-cd-pipelines"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-batch-jobs"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-web-scraping-services"),
      use: ["vm"],
    },
    {
      type: t("resouce-comparison-logging-services"),
      use: ["deployment"],
    },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
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
          {t("example-use-cases")}
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
                  <TableCell>{t("use-case")}</TableCell>
                  <TableCell>{t("resource-kubernetes-deployment")}</TableCell>
                  <TableCell>{t("resource-vm")}</TableCell>
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
          <Button onClick={() => setDialogOpen(false)}>
            {t("button-close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResourceComparisonTable;
