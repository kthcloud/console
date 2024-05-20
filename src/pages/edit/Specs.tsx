import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useTranslation } from "react-i18next";
import { Deployment, Resource, Vm } from "../../types";
import { CustomTheme } from "../../theme/types";
import useResource from "../../hooks/useResource";
import { useEffect, useState } from "react";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { updateDeployment } from "../../api/deploy/deployments";
import { enqueueSnackbar } from "notistack";
import { errorHandler } from "../../utils/errorHandler";
import { updateVM } from "../../api/deploy/v2/vms";
import { LoadingButton } from "@mui/lab";

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
  const [maxReplicas, setMaxReplicas] = useState<number>(MAX_REPLICAS);

  const getInitialCpu = () => {
    if (resource.type === "deployment") {
      return (resource as Deployment).cpuCores;
    } else if (resource.type === "vm") {
      const vm = resource as Vm;
      if (vm.specs === undefined || vm.specs.cpuCores === undefined) return 0;
      return vm.specs.cpuCores;
    } else {
      return 0;
    }
  };

  const getInitialRam = () => {
    if (resource.type === "deployment") {
      return (resource as Deployment).ram;
    } else if (resource.type === "vm") {
      const vm = resource as Vm;
      if (vm.specs === undefined || vm.specs.ram === undefined) return 0;
      return vm.specs.ram;
    } else {
      return 0;
    }
  };

  const [cpu, setCpu] = useState<number>(getInitialCpu());
  const [ram, setRam] = useState<number>(getInitialRam());
  const [replicas, setReplicas] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const updateSpecs = () => {
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      setCpu(d.cpuCores);
      setRam(d.ram);
      setReplicas(d.replicas);
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

  // Set max values
  useEffect(() => {
    setMaxCpu(20);
    setMaxRam(20);
    setMaxReplicas(20);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const isSame = () => {
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      return d.cpuCores === cpu && d.ram === ram && d.replicas === replicas;
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
      setCpu(d.cpuCores);
      setRam(d.ram);
      setReplicas(d.replicas);
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
        const res = await updateDeployment(
          d.id,
          { replicas: replicas, cpuCores: cpu, ram: ram },
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
                  onChange={(_, v) => setCpu(v as number)}
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
                  onChange={(_, v) => setRam(v as number)}
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
                    onChange={(_, v) => setReplicas(v as number)}
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
