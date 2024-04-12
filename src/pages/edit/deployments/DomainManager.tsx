import { LoadingButton } from "@mui/lab";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateDeployment } from "../../../api/deploy/deployments";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";
import { toUnicode } from "punycode";
import { useTranslation } from "react-i18next";
import { sentenceCase } from "change-case";
import { Deployment } from "../../../types";

export const DomainManager = ({ deployment }: { deployment: Deployment }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialDomain, setInitialDomain] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = t("setup-custom-domain-steps").split("|");

  useEffect(() => {
    if (!deployment.customDomainUrl) return;

    const cleaned = toUnicode(
      deployment.customDomainUrl.replace("https://", "").trim()
    );
    setDomain(cleaned);
    setInitialDomain(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (d: string): Promise<boolean> => {
    if (!(initialized && keycloak.token)) return false;
    const newDomain = d.trim();

    setLoading(true);
    let success = true;
    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: newDomain },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-domain-update"), {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-update-domain") + e, {
          variant: "error",
        })
      );
      success = false;
    } finally {
      setLoading(false);
    }
    return success;
  };

  const handleClear = async () => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);
    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: null },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-domain-update"), {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-update-domain") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!domain) {
        enqueueSnackbar(t("domain-missing"), {
          variant: "error",
        });
        return;
      }
      if (
        deployment.customDomainUrl &&
        deployment.customDomainUrl.split("//")[1] === domain
      ) {
        setActiveStep((step) => step + 1);
        return;
      }
      if (!(await handleSave(domain))) return;
    }
    if (activeStep === steps.length - 1) {
      setCreateDialogOpen(false);
      return;
    }
    setActiveStep((step) => step + 1);
  };

  return (
    <>
      <Drawer
        anchor={md ? "bottom" : "right"}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
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
        <Box component="div" sx={{ p: 2, maxWidth: 700 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3" sx={{ p: 2 }}>
              {t("setup-custom-domain")}
            </Typography>
            <IconButton onClick={() => setCreateDialogOpen(false)}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Stack
            direction="column"
            alignItems={"flex-start"}
            useFlexGap
            spacing={5}
            sx={{ minWidth: "100%" }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel={md}
              sx={{ minWidth: "100%" }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-0")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-0-warning")}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          <TextField
                            label={t("create-deployment-domain")}
                            variant="outlined"
                            placeholder={initialDomain}
                            value={domain}
                            onChange={(e) => {
                              setDomain(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleNext();
                              }
                            }}
                            sx={{ minWidth: 150 }}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {activeStep === 1 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1")}
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1-table")}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl ? (
                            deployment.customDomainUrl.split("//")[1]
                          ) : (
                            <Skeleton />
                          )}
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TXT</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl ? (
                            "_kthcloud." +
                            deployment.customDomainUrl.split("//")[1]
                          ) : (
                            <Skeleton />
                          )}
                        </TableCell>
                        <TableCell>{deployment.customDomainSecret}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {activeStep === 2 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-2")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-2-warning")}
                </Typography>
              </>
            )}
          </Stack>
        </Box>
        <Box component="div" sx={{ flexGrow: 1 }} />
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
            variant="outlined"
            onClick={() => setCreateDialogOpen(false)}
            size="large"
            startIcon={<Iconify icon="mdi:close" />}
          >
            {t("button-close")}
          </Button>
          <Box component="div" sx={{ flexGrow: 1 }} />
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={() => setActiveStep(activeStep - 1)}
              size="large"
              startIcon={<Iconify icon="material-symbols:arrow-left-rounded" />}
            >
              {t("previous")}
            </Button>
          )}

          <LoadingButton
            variant="contained"
            onClick={handleNext}
            loading={loading}
            size="large"
            endIcon={<Iconify icon="material-symbols:arrow-right-rounded" />}
          >
            {t("next")}
          </LoadingButton>
        </Stack>
      </Drawer>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment-domain")}
          subheader={t("setup-custom-domain-subheader")}
        />
        <CardContent>
          <Stack direction="column" spacing={3}>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {deployment.customDomainStatus && (
                <Chip
                  label={
                    t("admin-status") +
                    ": " +
                    sentenceCase(deployment.customDomainStatus)
                  }
                />
              )}
              {deployment.customDomainUrl && (
                <Chip
                  label={deployment.customDomainUrl}
                  icon={<Iconify icon="mdi:globe" />}
                  component={Link}
                  href={deployment.customDomainUrl}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                />
              )}
              <Button
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
                startIcon={
                  <Iconify
                    icon={
                      !deployment.customDomainUrl ? "mdi:plus" : "mdi:pencil"
                    }
                  />
                }
              >
                {!deployment.customDomainUrl
                  ? t("setup-domain")
                  : t("edit-domain")}
              </Button>
              {deployment.customDomainUrl && (
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  color="error"
                  startIcon={<Iconify icon="mdi:trash" />}
                >
                  {t("clear-domain")}
                </Button>
              )}
            </Stack>
            {!deployment.customDomainUrl ? (
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {t("no-custom-domain")}
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1-table")}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl.split("//")[1]}
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TXT</TableCell>
                        <TableCell>
                          _kthcloud.{deployment.customDomainUrl.split("//")[1]}
                        </TableCell>
                        <TableCell>{deployment.customDomainSecret}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};
