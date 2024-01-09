import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
  Button,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Skeleton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import {
  attachGPU,
  detachGPU,
  getGPUs,
  attachGPUById,
} from "src/api/deploy/vms";
import { errorHandler } from "src/utils/errorHandler";
import { hashGPUId } from "src/utils/helpers";
import { useTranslation } from "react-i18next";

export const GPUManager = ({ vm }) => {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();

  const [gpus, setGpus] = useState([]);
  const [gpuPickerOpen, setGpuPickerOpen] = useState(false);
  const [gpuChoice, setGpuChoice] = useState("");
  const [gpuLoading, setGpuLoading] = useState(false);
  const { initialLoad, user } = useResource();
  const theme = useTheme();

  const userCanListGPUs = () => {
    if (!user) return false;
    return user.role.permissions.includes("chooseGpu");
  };

  const userCanUseGPUs = () => {
    if (!user) return false;
    return user.role.permissions.includes("useGpus");
  };

  useEffect(() => {
    setGpuLoading(false);
    loadGPUs();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.gpu]);

  useEffect(() => {
    loadGPUs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGPUs = async () => {
    if (userCanListGPUs) {
      try {
        const gpuRes = await getGPUs(keycloak.token);

        // sort by name
        gpuRes.sort((a, b) => {
          if (a.name < b.name) return 1;
          if (a.name > b.name) return -1;
          return hashGPUId(a.id) < hashGPUId(b.id) ? -1 : 1;
        });

        setGpus(gpuRes);
      } catch (_) {}
    }
  };

  const renderButtonText = () => {
    if (!vm.gpu) return t("lease-gpu");
    return t("renew-gpu-lease");
  };

  return (
    <>
      {!(initialLoad && user) ? (
        <CircularProgress />
      ) : (
        <>
          {userCanUseGPUs() && (
            <Card sx={{ boxShadow: 20 }}>
              <CardHeader
                title={t("gpu-lease")}
                subheader={t("gpu-lease-subheader")}
              />
              <CardContent>
                <Stack spacing={3} direction={"column"} useFlexGap={true}>
                  <Stack
                    spacing={3}
                    direction={"row"}
                    flexWrap={"wrap"}
                    useFlexGap={true}
                    alignItems={"center"}
                  >
                    {vm.gpu && !gpuLoading && (
                      <Chip
                        m={1}
                        icon={<Iconify icon="mdi:gpu" width={24} height={24} />}
                        label={
                          <Stack
                            direction={"row"}
                            alignItems={"center"}
                            useFlexGap={true}
                            justifyContent={"space-between"}
                            spacing={2}
                          >
                            <span>{"NVIDIA " + vm.gpu.name}</span>
                            <Typography
                              variant={"caption"}
                              color={"grey"}
                              sx={{ fontFamily: "monospace" }}
                            >
                              {hashGPUId(vm.gpu.id)}
                            </Typography>
                          </Stack>
                        }
                      />
                    )}

                    {vm.gpu && !vm.gpu.expired && !gpuLoading && (
                      <Chip
                        m={1}
                        icon={
                          <Iconify
                            icon="mdi:clock-outline"
                            width={24}
                            height={24}
                          />
                        }
                        label={
                          <span>
                            {t("leased-until")}
                            <b
                              style={{
                                fontFamily: "monospace",
                                marginLeft: ".5em",
                              }}
                            >
                              {new Date(vm.gpu.leaseEnd).toLocaleString(
                                navigator.language
                              )}
                            </b>
                          </span>
                        }
                      />
                    )}

                    {vm.gpu && vm.gpu.expired && !gpuLoading && (
                      <Chip
                        m={1}
                        color="error"
                        icon={
                          <Iconify
                            icon="mdi:clock-outline"
                            width={24}
                            height={24}
                          />
                        }
                        label={
                          <span>
                            {t("lease-expired")}
                            <b
                              style={{
                                fontFamily: "monospace",
                                marginLeft: ".5em",
                              }}
                            >
                              {new Date(vm.gpu.leaseEnd).toLocaleString(
                                navigator.language
                              )}
                            </b>
                          </span>
                        }
                      />
                    )}

                    {gpuLoading && (
                      <Skeleton height={"2rem"} sx={{ width: "50%" }} />
                    )}

                    {!(gpuPickerOpen || gpuLoading) &&
                      (!vm.gpu || (vm.gpu && vm.gpu.expired)) && (
                        <Button
                          onClick={async () => {
                            if (userCanListGPUs() && !vm.gpu) {
                              setGpuPickerOpen(true);
                              return;
                            }

                            if (vm.gpu && vm.gpu.expired) {
                              try {
                                setGpuLoading(true);
                                const res = await attachGPUById(
                                  vm,
                                  keycloak.token,
                                  vm.gpu.id
                                );
                                queueJob(res);
                              } catch (error) {
                                errorHandler(error).forEach((e) =>
                                  enqueueSnackbar(
                                    t("could-not-attach-gpu") + e,
                                    {
                                      variant: "error",
                                    }
                                  )
                                );
                              } finally {
                                setGpuLoading(false);
                              }
                              return;
                            }

                            try {
                              setGpuLoading(true);
                              const res = await attachGPU(vm, keycloak.token);
                              queueJob(res);
                            } catch (error) {
                              setGpuLoading(false);
                              errorHandler(error).forEach((e) =>
                                enqueueSnackbar(t("could-not-attach-gpu") + e, {
                                  variant: "error",
                                })
                              );
                            }
                          }}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:gpu" />}
                          color={!vm.gpu ? "primary" : "warning"}
                          disabled={
                            !(
                              vm.status === "resourceRunning" ||
                              vm.status === "resourceStopped"
                            )
                          }
                        >
                          {renderButtonText()}
                        </Button>
                      )}

                    {!(gpuPickerOpen || gpuLoading || !vm.gpu) && (
                      <Button
                        onClick={async () => {
                          try {
                            setGpuLoading(true);
                            const res = await detachGPU(vm, keycloak.token);
                            queueJob(res);
                          } catch (error) {
                            errorHandler(error).forEach((e) =>
                              enqueueSnackbar(t("could-not-detach-gpu") + e, {
                                variant: "error",
                              })
                            );
                          } finally {
                            setGpuLoading(false);
                          }
                        }}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="eva:trash-2-fill" />}
                        color={"error"}
                        disabled={
                          !(
                            vm.status === "resourceRunning" ||
                            vm.status === "resourceStopped"
                          )
                        }
                      >
                        {t("button-detach-gpu")}
                      </Button>
                    )}

                    {vm.gpu && vm.gpu.expired && (
                      <>
                        <Typography variant="body2">
                          <b>{t("lease-expired-header")}</b>
                          {t("lease-expired-subheader")}
                        </Typography>
                      </>
                    )}

                    {gpuPickerOpen && (
                      <>
                        {gpus.length === 0 ? (
                          <Skeleton height={"5rem"} />
                        ) : (
                          <FormControl fullWidth>
                            <InputLabel id="gpu-picker-label">
                              {t("resource-gpu")}
                            </InputLabel>
                            <Select
                              labelId="gpu-picker-label"
                              id="gpu-picker"
                              value={gpuChoice}
                              onChange={(e) => setGpuChoice(e.target.value)}
                              label={t("resource-gpu")}
                              fullWidth
                              defaultOpen
                            >
                              {gpus.map((gpu, index) => (
                                <MenuItem
                                  key={gpu.id}
                                  value={gpu.id}
                                  sx={{
                                    background:
                                      index % 2 === 0 &&
                                      theme.palette.grey[200],
                                  }}
                                  disabled={Boolean(
                                    gpu.lease && !gpu.lease.expired
                                  )}
                                >
                                  <Stack
                                    direction={"row"}
                                    alignItems={"center"}
                                    useFlexGap={true}
                                    justifyContent={"flex-end"}
                                    spacing={3}
                                    flexWrap={"wrap"}
                                    sx={{ width: "100%", my: 1 }}
                                  >
                                    <span style={{ flexGrow: 1 }}>
                                      {"NVIDIA " + gpu.name}
                                    </span>

                                    {gpu.lease &&
                                      gpu.lease.end &&
                                      !gpu.lease.expired && (
                                        <Chip
                                          label={
                                            <span>
                                              {t("leased-until")}
                                              <b
                                                style={{
                                                  fontFamily: "monospace",
                                                  marginLeft: ".5em",
                                                }}
                                              >
                                                {new Date(
                                                  gpu.lease.end
                                                ).toLocaleString(
                                                  navigator.language
                                                )}
                                              </b>
                                            </span>
                                          }
                                          icon={
                                            <Iconify
                                              icon="mdi:clock-outline"
                                              width={24}
                                              height={24}
                                            />
                                          }
                                        />
                                      )}

                                    <Typography
                                      variant={"caption"}
                                      color={"grey"}
                                      sx={{ fontFamily: "monospace" }}
                                    >
                                      {hashGPUId(gpu.id)}
                                    </Typography>
                                  </Stack>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <Stack direction="row" spacing={3} useFlexGap={true}>
                          <Button
                            onClick={() => setGpuPickerOpen(false)}
                            color="error"
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            onClick={async () => {
                              setGpuLoading(true);
                              setGpuPickerOpen(false);
                              try {
                                const res = await attachGPUById(
                                  vm,
                                  keycloak.token,
                                  gpuChoice
                                );
                                queueJob(res);
                                setGpuChoice("");
                                enqueueSnackbar(t("gpu-attached"), {
                                  variant: "success",
                                });
                              } catch (error) {
                                setGpuLoading(false);

                                errorHandler(error).forEach((e) =>
                                  enqueueSnackbar(
                                    t("could-not-attach-gpu") + e,
                                    {
                                      variant: "error",
                                    }
                                  )
                                );
                              }
                            }}
                            color="primary"
                          >
                            {t("lease-gpu")}
                          </Button>
                        </Stack>
                      </>
                    )}
                  </Stack>

                  <Typography variant="body2">
                    {t("gpu-drivers-1")}
                    <br />
                    {t("gpu-drivers-2")}
                    <CopyToClipboard text="apt install nvidia-driver-535-server nvidia-utils-535-server -y">
                      <Tooltip enterTouchDelay={10} title="Copy to clipboard">
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          apt install nvidia-driver-535-server
                          nvidia-utils-535-server -y
                        </span>
                      </Tooltip>
                    </CopyToClipboard>
                    {t("gpu-drivers-3")}

                    <Link
                      href="https://help.ubuntu.com/community/NvidiaDriversInstallation"
                      target="_blank"
                      rel="noreferrer"
                      ml={1}
                    >
                      {t("learn-more")}
                    </Link>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
};
