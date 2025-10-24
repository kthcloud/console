import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useTranslation } from "react-i18next";
import { Deployment, DeploymentGPU, Resource, Vm } from "../../types";
import { CustomTheme } from "../../theme/types";
import useResource from "../../hooks/useResource";
import { useEffect, useState } from "react";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { updateDeployment } from "../../api/deploy/deployments";
import { enqueueSnackbar } from "notistack";
import { errorHandler } from "../../utils/errorHandler";
import { updateVM } from "../../api/deploy/vms";
import { LoadingButton } from "@mui/lab";
import { AddCircleOutline, Delete } from "@mui/icons-material";

export const Specs = ({ resource }: { resource: Resource }) => {
  const { t } = useTranslation();
  const theme: CustomTheme = useTheme();
  const { initialized, keycloak } = useKeycloak();

  const { user, queueJob } = useResource();

  const STEP_DEPLOYMENT = 0.2;
  const MIN_CPU_DEPLOYMENT = 0.2;
  const MIN_RAM_DEPLOYMENT = 0.5;
  const MIN_REPLICAS = 0;

  const MAX_CPU_DEPLOYMENT = 20;
  const MAX_RAM_DEPLOYMENT = 20;
  const MAX_REPLICAS = 20;

  const STEP_VM = 1;
  const MIN_CPU_VM = 1;
  const MIN_RAM_VM = 2;

  const MAX_CPU_VM = 20;
  const MAX_RAM_VM = 20;

  const [maxCpu, setMaxCpu] = useState<number>(
    resource.type === "vm" ? MAX_CPU_VM : MAX_CPU_DEPLOYMENT
  );
  const [maxRam, setMaxRam] = useState<number>(
    resource.type === "vm" ? MAX_RAM_VM : MAX_RAM_DEPLOYMENT
  );
  const [maxReplicas, _] = useState<number>(MAX_REPLICAS);

  const getInitialCpu = () => {
    return resource.specs.cpuCores || 0;
  };

  const getInitialRam = () => {
    return resource.specs.ram || 0;
  };

  const getInitialGPUs = () =>
    resource.type === "deployment" ? resource.specs.gpus : undefined;

  const [cpu, setCpu] = useState<number>(getInitialCpu());
  const [ram, setRam] = useState<number>(getInitialRam());
  const [replicas, setReplicas] = useState<number>(0);
  const [gpus, setGpus] = useState<DeploymentGPU[] | undefined>(
    getInitialGPUs()
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const toClosestStep = (value: number, step: number) => {
    return Math.round(Math.floor(value / step) * step * 100) / 100;
  };

  const calculateResourcesLeft = (
    quota: { cpuCores: number; ram: number },
    usage: { cpuCores: number; ram: number },
    currentUsage: {
      cpuCores: number;
      ram: number;
      replicas?: number;
    }
  ): {
    totalCoresLeft: number;
    totalRamLeft: number;
  } => {
    const usageWithoutDepl = {
      cpuCores: Math.max(
        usage.cpuCores - currentUsage.cpuCores * (currentUsage.replicas ?? 1),
        0
      ),
      ram: Math.max(
        usage.ram - currentUsage.ram * (currentUsage.replicas ?? 1),
        0
      ),
    };

    const totalCoresLeft = quota.cpuCores - usageWithoutDepl.cpuCores;
    const totalRamLeft = quota.ram - usageWithoutDepl.ram;

    return { totalCoresLeft, totalRamLeft };
  };

  const validateGPU = (gpu: DeploymentGPU): boolean =>
    !!gpu.name &&
    Boolean(
      (gpu.templateName && !gpu.claimName) ||
        (!gpu.templateName && gpu.claimName)
    );

  useEffect(() => {
    if (user) {
      const currentUsage = {
        cpuCores: resource.specs.cpuCores ?? 0,
        ram: resource.specs.ram ?? 0,
        replicas: (resource as Deployment).specs.replicas,
      };

      const { totalCoresLeft, totalRamLeft } = calculateResourcesLeft(
        user.quota,
        user.usage,
        currentUsage
      );

      const newmax = {
        cpuCores: toClosestStep(
          Math.ceil(
            (replicas !== 0 ? totalCoresLeft / replicas : totalCoresLeft) * 10
          ) / 10,
          resource.type === "vm" ? STEP_VM : STEP_DEPLOYMENT
        ),
        ram: toClosestStep(
          Math.ceil(
            (replicas !== 0 ? totalRamLeft / replicas : totalRamLeft) * 10
          ) / 10,
          resource.type === "vm" ? STEP_VM : STEP_DEPLOYMENT
        ),
      };

      setMaxCpu(
        // Set the maxCpu to the highest of the new max or the current value.
        // This since the current value has been allowed previously, but the user is actually exceeding their quota.
        Math.max(
          newmax.cpuCores,
          replicas !== 0
            ? currentUsage.cpuCores / replicas
            : currentUsage.cpuCores
        )
      );
      setMaxRam(
        // Set the maxRam to the highest of the new max or the current value.
        // This since the current value has been allowed previously, but the user is actually exceeding their quota.
        Math.max(
          newmax.ram,
          replicas !== 0 ? currentUsage.ram / replicas : currentUsage.ram
        )
      );
    }
  }, [user, resource, cpu, ram, replicas]);

  const updateSpecs = () => {
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      setCpu(d.specs.cpuCores);
      setRam(d.specs.ram);
      setReplicas(d.specs.replicas);
      setGpus(d.specs.gpus);
      return;
    }
    if (resource.type === "vm" && resource.specs) {
      const v = resource as Vm;
      resource.specs.cpuCores != undefined &&
        setCpu(v.specs?.cpuCores ? v.specs.cpuCores : MIN_CPU_VM);
      resource.specs.ram != undefined &&
        setRam(v.specs?.ram ? v.specs.ram : MIN_RAM_VM);
      return;
    }
  };

  useEffect(
    () => {
      if (!editing && !loading) {
        updateSpecs();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resource]
  );

  // Cap values to max/min
  useEffect(
    () => {
      if (resource.type === "vm") {
        if (ram < MIN_RAM_VM) setRam(MIN_RAM_VM);
        if (cpu < MIN_CPU_VM) setCpu(MIN_CPU_VM);
      }
      if (resource.type === "deployment") {
        if (ram < MIN_RAM_DEPLOYMENT) setRam(MIN_RAM_DEPLOYMENT);
        if (cpu < MIN_CPU_DEPLOYMENT) setCpu(MIN_CPU_DEPLOYMENT);
        if (replicas < MIN_REPLICAS) setReplicas(MIN_REPLICAS);
      }

      // Admins can bypass max values
      if (user && user.admin) return;
      if (ram > maxRam) setRam(maxRam);
      if (cpu > maxCpu) setCpu(maxCpu);
      if (replicas > maxReplicas) setReplicas(maxReplicas);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cpu, ram, replicas, maxCpu, maxRam, maxReplicas]
  );

  const isSame = () => {
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      return (
        d.specs.cpuCores === cpu &&
        d.specs.ram === ram &&
        d.specs.replicas === replicas &&
        gpusEqual(d.specs.gpus, gpus)
      );
    }
    if (resource.type === "vm" && resource.specs) {
      const v = resource as Vm;
      return v.specs!.cpuCores === cpu && v.specs!.ram === ram;
    }
    return false;
  };

  const handleCancel = () => {
    setLoading(true);
    setEditing(false);
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      setCpu(d.specs.cpuCores);
      setRam(d.specs.ram);
      setReplicas(d.specs.replicas);
      setGpus(d.specs.gpus);
      setLoading(false);
      return;
    }
    if (resource.type === "vm" && resource.specs) {
      const v = resource as Vm;
      resource.specs.cpuCores && setCpu(v.specs!.cpuCores!);
      resource.specs.ram && setRam(v.specs!.ram!);
      setLoading(false);
      return;
    }
  };

  const handleApply = async () => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      try {
        const sanitizedGpus = gpus?.map((gpu) => {
          return Object.fromEntries(
            Object.entries(gpu).filter(([_, v]) => v !== undefined && v !== "")
          );
        });

        const res = await updateDeployment(
          d.id,
          { replicas: replicas, cpuCores: cpu, ram: ram, gpus: sanitizedGpus },
          keycloak.token
        );

        queueJob(res);
        enqueueSnackbar(t("specs-saving"), { variant: "info" });
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("could-not-save-specs") + e, {
            variant: "error",
          })
        );
      } finally {
        setLoading(false);
        setEditing(false);
        return;
      }
    }
    if (resource.type === "vm" && resource.specs) {
      const v = resource as Vm;
      try {
        const res = await updateVM(keycloak.token, v.id, {
          cpuCores: cpu,
          ram: ram,
        });
        queueJob(res);
        enqueueSnackbar(t("specs-saving"), { variant: "info" });
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("could-not-save-specs") + e, {
            variant: "error",
          })
        );
      } finally {
        setLoading(false);
        setEditing(false);
        return;
      }
    }
  };

  return (
    <Card>
      <CardHeader title={t("admin-specs")} subheader={t("specs-subheader")} />
      <CardContent>
        {!editing ? (
          <Stack
            spacing={3}
            direction={"row"}
            flexWrap={"wrap"}
            useFlexGap={true}
          >
            <Chip
              sx={{ p: 1 }}
              icon={<Iconify icon="uil:processor" width={24} height={24} />}
              label={
                <span style={{ marginLeft: ".5rem" }}>
                  {t("landing-hero-cpu")}
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: "1rem",
                    }}
                  >
                    {cpu}
                  </b>
                </span>
              }
            />
            <Chip
              sx={{ p: 1 }}
              icon={<Iconify icon="bi:memory" width={24} height={24} />}
              label={
                <span style={{ marginLeft: ".5rem" }}>
                  {t("memory")}
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: "1rem",
                    }}
                  >
                    {ram + " GB"}
                  </b>
                </span>
              }
            />
            {resource.type === "deployment" && (
              <>
                <Chip
                  sx={{ p: 1 }}
                  icon={<Iconify icon="mage:stack" width={24} height={24} />}
                  label={
                    <span style={{ marginLeft: ".5rem" }}>
                      {t("replicas")}
                      <b
                        style={{
                          fontFamily: "monospace",
                          marginLeft: "1rem",
                        }}
                      >
                        {replicas}
                      </b>
                    </span>
                  }
                />
                {Array.isArray(gpus) &&
                  gpus!.map((gpu: DeploymentGPU, index: number) => (
                    <Chip
                      key={gpu.name || index}
                      icon={<Iconify icon="mdi:gpu" width={20} height={20} />}
                      label={
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".4rem",
                            marginLeft: ".25rem",
                          }}
                        >
                          <span style={{ opacity: 0.8 }}>GPU:</span>
                          <b>{gpu.name}</b>
                          {gpu.claimName ||
                            (gpu.templateName && (
                              <span
                                style={{ opacity: 0.6, fontSize: "0.8rem" }}
                              >
                                ({gpu.claimName || gpu.templateName})
                              </span>
                            ))}
                        </span>
                      }
                    />
                  ))}
              </>
            )}
            {resource.type === "vm" &&
              resource.specs &&
              resource.specs.diskSize && (
                <Chip
                  sx={{ p: 1 }}
                  icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
                  label={
                    <span style={{ marginLeft: ".5rem" }}>
                      {t("create-vm-disk-size")}
                      <b
                        style={{
                          fontFamily: "monospace",
                          marginLeft: "1rem",
                        }}
                      >
                        {resource.specs.diskSize + " GB"}
                      </b>
                    </span>
                  }
                />
              )}

            <Chip
              sx={{ p: 1 }}
              icon={
                <Iconify
                  icon="material-symbols:speed-outline"
                  width={24}
                  height={24}
                />
              }
              label={
                <span style={{ marginLeft: ".5rem" }}>
                  {t("network-speed")}
                  <b
                    style={{
                      fontFamily: "monospace",
                      marginLeft: "1rem",
                    }}
                  >
                    {"1 Gbps"}
                  </b>
                </span>
              }
            />
          </Stack>
        ) : (
          <Grid container>
            {/* CPU */}
            <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
              <Grid xs={12}>
                <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                  {t("landing-hero-cpu") +
                    (resource.type === "deployment"
                      ? " " + t("per-replica")
                      : "")}
                </Typography>
              </Grid>
              <Grid xs={12}>
                <Slider
                  value={cpu}
                  onChange={(_: any, v: any) => setCpu(v as number)}
                  min={resource.type === "vm" ? MIN_CPU_VM : MIN_CPU_DEPLOYMENT}
                  max={maxCpu}
                  step={resource.type === "vm" ? STEP_VM : STEP_DEPLOYMENT}
                />
              </Grid>
              <Grid xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {resource.type === "vm" ? MIN_CPU_VM : MIN_CPU_DEPLOYMENT}
                  </Typography>
                  <TextField
                    id="cores"
                    value={!Number.isNaN(cpu) ? cpu : ""}
                    onChange={(e) => setCpu(parseInt(e.target.value))}
                    size="small"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    variant="outlined"
                    sx={{
                      width: 100,
                    }}
                  />
                  <Typography variant="body2" fontFamily="monospace">
                    {maxCpu}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* RAM */}
            <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
              <Grid xs={12}>
                <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                  {t("memory") +
                    ", GB" +
                    (resource.type === "deployment"
                      ? " " + t("per-replica")
                      : "")}
                </Typography>
              </Grid>
              <Grid xs={12}>
                <Slider
                  value={ram}
                  onChange={(_: any, v: any) => setRam(v as number)}
                  min={resource.type === "vm" ? MIN_RAM_VM : MIN_RAM_DEPLOYMENT}
                  max={maxRam}
                  step={resource.type === "vm" ? STEP_VM : STEP_DEPLOYMENT}
                />
              </Grid>
              <Grid xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {resource.type === "vm" ? MIN_RAM_VM : MIN_RAM_DEPLOYMENT}
                  </Typography>

                  <TextField
                    id="ram"
                    value={!Number.isNaN(ram) ? ram : ""}
                    onChange={(e) => setRam(parseInt(e.target.value))}
                    size="small"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    variant="outlined"
                    sx={{
                      width: 100,
                    }}
                  />

                  <Typography variant="body2" fontFamily="monospace">
                    {maxRam}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* Replicas */}
            {resource.type === "deployment" && (
              <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
                <Grid xs={12}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                      {t("replicas")}
                    </Typography>
                    <Tooltip
                      enterTouchDelay={10}
                      title={
                        <>
                          <Typography variant="caption">
                            {t("replicas-subheader")}
                          </Typography>
                          <br />
                          <br />
                          <Typography variant="caption">
                            {t("replica-quota")}
                          </Typography>
                          <br />
                          <br />
                          <Typography variant="caption">
                            {t("replicas-shutdown")}
                          </Typography>
                        </>
                      }
                    >
                      <span>
                        <Iconify
                          icon="mdi:help-circle-outline"
                          color={theme.palette.text.secondary}
                        />
                      </span>
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid xs={12}>
                  <Slider
                    value={replicas}
                    onChange={(_: any, v: any) => setReplicas(v as number)}
                    min={MIN_REPLICAS}
                    max={maxReplicas}
                    step={1}
                  />
                </Grid>
                <Grid xs={12}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" fontFamily="monospace">
                      {MIN_REPLICAS}
                    </Typography>
                    <TextField
                      id="replicas"
                      value={!Number.isNaN(replicas) ? replicas : ""}
                      onChange={(e) => setReplicas(parseInt(e.target.value))}
                      size="small"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      variant="outlined"
                      sx={{
                        width: 100,
                      }}
                    />
                    <Typography variant="body2" fontFamily="monospace">
                      {maxReplicas}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {/* GPUs */}
            {resource.type === "deployment" && (
              <>
                <Grid
                  container
                  xs={12}
                  sm={8}
                  sx={{ px: 3, py: 1 }}
                  spacing={1}
                >
                  <Grid xs={12}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                        {t("deployment-gpu")}
                      </Typography>
                      <Tooltip
                        enterTouchDelay={10}
                        title={
                          <>
                            <Typography variant="caption">
                              {t("deployment-gpu-subheader")}
                            </Typography>
                            <br />
                            <br />
                            <Typography variant="caption">
                              {t("deployment-gpu-quota")}
                            </Typography>
                            <br />
                            <br />
                            <Typography variant="caption">
                              {t("deployment-gpu-unstable")}
                            </Typography>
                          </>
                        }
                      >
                        <span>
                          <Iconify
                            icon="mdi:help-circle-outline"
                            color={theme.palette.text.secondary}
                          />
                        </span>
                      </Tooltip>
                    </Stack>
                  </Grid>
                  <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} fullWidth>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        fullWidth
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {t("deployment-gpu-configuration")}
                        </Typography>
                        <Button
                          startIcon={<AddCircleOutline />}
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            setGpus((prev) => [
                              ...(prev || []),
                              { name: "", templateName: "", claimName: "" },
                            ])
                          }
                        >
                          {t("deployment-gpu-add")}
                        </Button>
                      </Stack>
                    </Grid>

                    {(!gpus || gpus.length === 0) && (
                      <Grid item xs={12}>
                        <Stack
                          sx={{
                            borderRadius: 2,
                            p: 2,
                            bgcolor: (theme: any) => theme.palette.action.hover,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: "8.5px" }}
                          >
                            {t("deployment-gpu-none")}
                          </Typography>
                        </Stack>
                      </Grid>
                    )}

                    {gpus?.map((gpu, index) => {
                      const isValid = validateGPU(gpu);

                      const handleChange = (
                        index: number,
                        field: keyof DeploymentGPU,
                        value: string
                      ) => {
                        const unset = field === "name" ? "" : undefined;
                        const trimmed = value.trim();
                        setGpus((prev) => {
                          const updated = [...(prev || [])];
                          updated[index] = {
                            ...updated[index],
                            [field]: trimmed === "" ? unset : trimmed,
                          };
                          return updated;
                        });
                      };

                      return (
                        <Grid item xs={12} key={index}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems="center"
                            sx={{
                              border: "1px solid",
                              borderColor: isValid ? "divider" : "error.main",
                              borderRadius: 2,
                              p: 2,
                            }}
                          >
                            <TextField
                              label={t("deployment-gpu-name")}
                              value={gpu.name}
                              onChange={(e) =>
                                handleChange(index, "name", e.target.value)
                              }
                              required
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label={t(
                                "deployment-gpu-resourceclaimtemplate-name"
                              )}
                              value={gpu.templateName ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "templateName",
                                  e.target.value
                                )
                              }
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label={t("deployment-gpu-resourceclaim-name")}
                              value={gpu.claimName ?? ""}
                              onChange={(e) =>
                                handleChange(index, "claimName", e.target.value)
                              }
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <Tooltip title={t("deployment-gpu-remove")}>
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setGpus((prev) =>
                                    prev?.filter((_, i) => i !== index)
                                  )
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
                <Grid
                  item
                  sm={4}
                  sx={{
                    display: { xs: "none", sm: "block" },
                    backgroundColor: (theme: any) => theme.palette.action.hover,
                    borderRadius: "1rem",
                  }}
                >
                  <Stack fullWidth>
                    {gpus?.some((g) => !validateGPU(g)) && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1.5, mt: 0.5, display: "block" }}
                      >
                        {t("deployment-gpu-invalid-config-warning")}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </CardContent>
      <CardActions sx={{ m: 1 }}>
        {editing ? (
          <>
            <Button onClick={handleCancel} disabled={!(!isSame() || editing)}>
              {t("cancel")}
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleApply}
              loading={loading}
              disabled={isSame() || loading}
            >
              {t("apply")}
            </LoadingButton>
            {resource.type === "deployment" && replicas === 0 && !isSame() && (
              <Typography variant="body2">
                {t("replicas-shutdown-warning")}
              </Typography>
            )}
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>{t("button-edit")}</Button>
        )}
      </CardActions>
    </Card>
  );
};

const gpusEqual = (a?: DeploymentGPU[], b?: DeploymentGPU[]): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  return a.every((gpuA, index) => {
    const gpuB = b[index];
    if (!gpuB) return false;

    const keys = new Set([...Object.keys(gpuA), ...Object.keys(gpuB)]);
    for (const key of keys) {
      if ((gpuA as any)[key] !== (gpuB as any)[key]) return false;
    }
    return true;
  });
};
