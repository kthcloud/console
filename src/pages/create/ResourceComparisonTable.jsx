import {
  Backdrop,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
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

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
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
        size="large"
        fullWidth={sm}
        sx={{ px: 4, py: 3 }}
      >
        {t("example-use-cases")}
      </Button>

      <Drawer
        anchor={md ? "bottom" : "right"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            sx: {
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(3px)",
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3" sx={{ p: 2 }}>
              {t("example-use-cases")}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>

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
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />

        <Stack
          direction="row"
          spacing={1}
          alignItems={"center"}
          justifyContent={"space-between"}
          useFlexGap
          sx={{ p: 2 }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            startIcon={<Iconify icon="mdi:close" />}
            size="large"
          >
            {t("button-close")}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default ResourceComparisonTable;
