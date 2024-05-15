import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  InputBase,
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

export const Specs = ({ resource }: { resource: Resource }) => {
  const { t } = useTranslation();
  const theme: CustomTheme = useTheme();

  const { user } = useResource();

  const STEP_DEPLOYMENT = 0.2;
  const MIN_CPU_DEPLOYMENT = 0.2;
  const MIN_RAM_DEPLOYMENT = 0.5;
  const MIN_REPLICAS = 0;

  const STEP_VM = 1;
  const MIN_CPU_VM = 1;
  const MIN_RAM_VM = 2;
  const MIN_DISK = 20;

  const [maxCpu, setMaxCpu] = useState<number>(
    resource.type === "vm" ? MIN_CPU_VM : MIN_CPU_DEPLOYMENT
  );
  const [maxRam, setMaxRam] = useState<number>(
    resource.type === "vm" ? MIN_RAM_VM : MIN_RAM_DEPLOYMENT
  );
  const [maxReplicas, setMaxReplicas] = useState<number>(MIN_REPLICAS);
  const [maxDisk, setMaxDisk] = useState<number>(MIN_DISK);

  const [cpu, setCpu] = useState<number>(0);
  const [ram, setRam] = useState<number>(0);
  const [replicas, setReplicas] = useState<number>(0);
  const [disk, setDisk] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(
    () => {
      if (ram > maxRam) setRam(maxRam);
      if (cpu > maxCpu) setCpu(maxCpu);
      if (replicas > maxReplicas) setReplicas(maxReplicas);
      if (disk > maxDisk) setDisk(maxDisk);

      if (resource.type === "vm") {
        if (ram < MIN_RAM_VM) setRam(MIN_RAM_VM);
        if (cpu < MIN_CPU_VM) setCpu(MIN_CPU_VM);
        if (disk < MIN_DISK) setDisk(MIN_DISK);
      }
      if (resource.type === "deployment") {
        if (ram < MIN_RAM_DEPLOYMENT) setRam(MIN_RAM_DEPLOYMENT);
        if (cpu < MIN_CPU_DEPLOYMENT) setCpu(MIN_CPU_DEPLOYMENT);
        if (replicas < MIN_REPLICAS) setReplicas(MIN_REPLICAS);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cpu, ram, replicas, disk, maxCpu, maxRam, maxReplicas, maxDisk]
  );

  useEffect(() => {
    if (!user) return;
    if (user.admin) {
      setMaxCpu(100);
      setMaxRam(100);
      setMaxReplicas(100);
      setMaxDisk(100);
      return;
    }

    setMaxCpu(20);
    setMaxRam(20);
    setMaxReplicas(20);
    setMaxDisk(1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, resource]);

  const isSame = () => {
    if (resource.type === "deployment") {
      const d = resource as Deployment;
      return d.cpuCores === cpu && d.ram === ram && d.replicas === replicas;
    }
    if (resource.type === "vm" && resource.specs) {
      const v = resource as Vm;
      return (
        v.specs!.cpuCores === cpu &&
        v.specs!.ram === ram &&
        v.specs!.diskSize === disk
      );
    }
    return false;
  };

  const handleCancel = () => {
    setLoading(true);
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
      resource.specs.diskSize && setDisk(v.specs!.diskSize!);
      setLoading(false);
      return;
    }
  };

  return (
    <Card>
      <CardHeader title={t("admin-specs")} subheader={t("specs-subheader")} />
      <CardContent>
        <Stack direction="column" spacing={3}>
          <Grid container>
            {/* CPU */}
            <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
              <Grid xs={12}>
                <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                  {t("landing-hero-cpu")}
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
                  {t("memory")}
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

            {/* Disk */}
            {resource.type === "vm" && (
              <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
                <Grid xs={12}>
                  <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                    {t("create-vm-disk-size")}
                  </Typography>
                </Grid>
                <Grid xs={12}>
                  <Slider
                    value={disk}
                    onChange={(_, v) => setDisk(v as number)}
                    min={MIN_DISK}
                    max={maxDisk}
                    step={STEP_VM}
                  />
                </Grid>
                <Grid xs={12}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" fontFamily="monospace">
                      {MIN_DISK}
                    </Typography>
                    <TextField
                      id="disk"
                      value={!Number.isNaN(disk) ? disk : ""}
                      onChange={(e) => setDisk(parseInt(e.target.value))}
                      size="small"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      variant="outlined"
                      sx={{
                        width: 100,
                      }}
                    />
                    <Typography variant="body2" fontFamily="monospace">
                      {maxDisk}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {/* Replicas */}
            {resource.type === "deployment" && (
              <Grid container xs={12} sm={4} sx={{ px: 3, py: 1 }} spacing={1}>
                <Grid xs={12}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                      {t("replicas")}
                    </Typography>
                    <Tooltip
                      title={
                        <>
                          <Typography variant="caption">
                            {t("replicas-subheader")}
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
                      id="disk"
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
          <pre>{JSON.stringify(resource, null, 2)}</pre>
        </Stack>
      </CardContent>
      <CardActions sx={{ m: 1 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          useFlexGap
        ></Stack>
        <Button
          variant={loading ? "text" : "contained"}
          color="primary"
          onClick={() => console.log("apply")}
          disabled={loading}
        >
          {t("apply")}
        </Button>

        <Button onClick={handleCancel} disabled={isSame()}>
          {t("cancel")}
        </Button>
        {resource.type === "deployment" && replicas === 0 && !isSame() && (
          <Typography variant="body2">
            {t("replicas-shutdown-warning")}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};
