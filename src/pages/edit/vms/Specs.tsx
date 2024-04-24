import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updateVM } from "../../../api/deploy/v2/vms";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";
import { Vm } from "../../../types";
import { Specs as SpecsType } from "go-deploy-types/types/v1/body";

export default function Specs({ vm }: { vm: Vm }) {
  const { t } = useTranslation();

  const [specs, setSpecs] = useState<SpecsType | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const [cpuError, setCpuError] = useState<string>("");
  const [ramError, setRamError] = useState<string>("");

  const [availableCPU, setAvailableCPU] = useState(0);
  const [availableRAM, setAvailableRAM] = useState(0);

  const { initialLoad, user } = useResource();

  useEffect(() => {
    if (editing || loading) return;

    if (vm.specs) {
      setSpecs(vm.specs);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm]);

  useEffect(() => {
    if (!(user && specs && vm.specs?.cpuCores && vm.specs?.ram)) return;
    const usedCPU = user.usage.cpuCores - vm.specs.cpuCores;
    const totalCPU = user.quota.cpuCores;
    const availableCPU = totalCPU - usedCPU;

    const usedRAM = user.usage.ram - vm.specs.ram;
    const totalRAM = user.quota.ram;
    const availableRAM = totalRAM - usedRAM;

    setAvailableCPU(availableCPU);
    setAvailableRAM(availableRAM);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const calculateCPU = (raw: string) => {
    const value = parseInt(raw);
    if (!value) {
      setSpecs({ ...specs, cpuCores: 0 });
      setCpuError(t("create-vm-input-number"));
      return;
    }

    if (value > availableCPU) {
      setCpuError(t("create-vm-max-cpu") + ": " + availableCPU);
      setSpecs({ ...specs, cpuCores: value });
      return;
    }

    if (value < 1) {
      setCpuError(t("create-vm-minimum-cpu") + ": 1");
      setSpecs({ ...specs, cpuCores: value });
      return;
    }

    setCpuError("");
    setSpecs({ ...specs, cpuCores: value });
  };

  const calculateRAM = (raw: string) => {
    const value = parseInt(raw);
    if (!value) {
      setSpecs({ ...specs, ram: 0 });
      setRamError(t("create-vm-input-number"));
      return;
    }

    if (value > availableRAM) {
      setRamError(t("create-vm-max-ram") + ": " + availableRAM);
      setSpecs({ ...specs, ram: value });
      return;
    }

    if (value < 4) {
      setRamError(t("create-vm-minimum-ram") + ": 4 GB");
      setSpecs({ ...specs, ram: value });
      return;
    }

    setRamError("");
    setSpecs({ ...specs, ram: value });
  };

  const applyChanges = async () => {
    if (!(initialized && keycloak.token && specs)) return;
    setLoading(true);
    setEditing(false);

    try {
      const res = await updateVM(keycloak.token, vm.id, {
        cpuCores: specs.cpuCores,
        ram: specs.ram,
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
    }
  };

  if (!specs || loading || !user)
    return (
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title={t("admin-specs")} />
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );

  return (
    <>
      {!(initialLoad && user) ? (
        <CircularProgress />
      ) : (
        <Card sx={{ boxShadow: 20 }}>
          <CardHeader
            title={t("admin-specs")}
            subheader={t("specs-subheader")}
          />
          <CardContent>
            <Stack
              spacing={3}
              direction={"row"}
              flexWrap={"wrap"}
              useFlexGap={true}
            >
              {!editing && vm.specs ? (
                <Chip
                  icon={<Iconify icon="uil:processor" width={24} height={24} />}
                  label={
                    <span>
                      {t("landing-hero-cpu")}
                      <b
                        style={{
                          fontFamily: "monospace",
                          marginLeft: ".75em",
                        }}
                      >
                        {vm.specs.cpuCores}
                      </b>
                    </span>
                  }
                />
              ) : (
                <TextField
                  label={t("landing-hero-cpu")}
                  id="cores"
                  value={specs.cpuCores !== 0 ? specs.cpuCores : ""}
                  onChange={(e) => calculateCPU(e.target.value)}
                  size="small"
                  helperText={
                    cpuError
                      ? cpuError
                      : t("create-vm-number-of-cpu-cores") +
                        ", 2-" +
                        availableCPU
                  }
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={cpuError ? true : false}
                  variant="outlined"
                />
              )}

              {!editing && vm.specs ? (
                <Chip
                  icon={<Iconify icon="bi:memory" width={24} height={24} />}
                  label={
                    <span>
                      {t("memory")}
                      <b
                        style={{
                          fontFamily: "monospace",
                          marginLeft: ".75em",
                        }}
                      >
                        {vm.specs.ram + " GB"}
                      </b>
                    </span>
                  }
                />
              ) : (
                <TextField
                  label={t("memory")}
                  id="ram"
                  value={specs.ram !== 0 ? specs.ram : ""}
                  onChange={(e) => calculateRAM(e.target.value)}
                  size="small"
                  helperText={
                    ramError
                      ? ramError
                      : t("create-vm-amount-of-ram") +
                        ", 4-" +
                        availableRAM +
                        " GB"
                  }
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={ramError ? true : false}
                  variant="outlined"
                />
              )}

              {vm.specs && (
                <Chip
                  icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
                  label={
                    <span>
                      {t("create-vm-disk-size")}
                      <b
                        style={{
                          fontFamily: "monospace",
                          marginLeft: ".75em",
                        }}
                      >
                        {vm.specs.diskSize + " GB"}
                      </b>
                    </span>
                  }
                />
              )}
              <Chip
                icon={
                  <Iconify
                    icon="material-symbols:speed-outline"
                    width={24}
                    height={24}
                  />
                }
                label={
                  <span>
                    {t("network-speed")}
                    <b
                      style={{
                        fontFamily: "monospace",
                        marginLeft: ".75em",
                      }}
                    >
                      {"1 Gbps"}
                    </b>
                  </span>
                }
              />
            </Stack>
          </CardContent>

          <CardActions>
            {!editing && (
              <Button onClick={() => setEditing(true)}>
                {t("button-edit")}
              </Button>
            )}
            {editing && (
              <Button
                onClick={() => {
                  if (vm.specs) setSpecs(vm.specs);
                  setEditing(false);
                  setCpuError("");
                  setRamError("");
                }}
                color={"error"}
              >
                {t("cancel")}
              </Button>
            )}
            {editing && (
              <Button
                disabled={cpuError !== "" || ramError !== ""}
                onClick={() => applyChanges()}
              >
                {t("button-save")}
              </Button>
            )}
          </CardActions>
        </Card>
      )}
    </>
  );
}
