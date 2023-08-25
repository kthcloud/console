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
import { getUser } from "src/api/deploy/users";
import { updateVM } from "src/api/deploy/vms";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

export default function Specs({ vm }) {
  const [specs, setSpecs] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const [cpuError, setCpuError] = useState(null);
  const [ramError, setRamError] = useState(null);

  const [availableCPU, setAvailableCPU] = useState(0);
  const [availableRAM, setAvailableRAM] = useState(0);

  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching quotas: " + e, {
          variant: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (editing || loading) return;

    if (vm) {
      setSpecs(vm.specs);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm]);

  useEffect(() => {
    loadProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  useEffect(() => {
    if (!user) return;
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

  const calculateCPU = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setSpecs({ ...specs, cpuCores: "" });
      setCpuError("Input a number");
      return;
    }

    if (value > availableCPU) {
      setCpuError("Max CPU cores available: " + availableCPU);
      setSpecs({ ...specs, cpuCores: value });
      return;
    }

    if (value < 1) {
      setCpuError("Minimum CPU cores: 1");
      setSpecs({ ...specs, cpuCores: value });
      return;
    }

    setCpuError(null);
    setSpecs({ ...specs, cpuCores: value });
  };

  const calculateRAM = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setSpecs({ ...specs, ram: "" });
      setRamError("Input a number");
      return;
    }

    if (value > availableRAM) {
      setRamError("Max RAM available: " + availableRAM);
      setSpecs({ ...specs, ram: value });
      return;
    }

    if (value < 4) {
      setRamError("Minimum RAM: 4 GB");
      setSpecs({ ...specs, ram: value });
      return;
    }

    setRamError(null);
    setSpecs({ ...specs, ram: value });
  };

  const applyChanges = async () => {
    if (!initialized) return;
    setLoading(true);
    setEditing(false);

    try {
      const res = await updateVM(
        vm.id,
        { cpuCores: specs.cpuCores, ram: specs.ram },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar("Specs saving...", { variant: "success" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not update specs: " + e, {
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
        <CardHeader title={"Specs"} />
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={"Specs"}
        subheader={"Grow or shrink your VM to match your use case."}
      />
      <CardContent>
        <Stack
          spacing={3}
          direction={"row"}
          flexWrap={"wrap"}
          useFlexGap={true}
        >
          {!editing ? (
            <Chip
              m={1}
              icon={<Iconify icon="uil:processor" width={24} height={24} />}
              label={
                <span>
                  CPU Cores
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
              label="Cores"
              id="cores"
              value={specs.cpuCores}
              onChange={(e) => calculateCPU(e.target.value)}
              size="small"
              helperText={
                cpuError ? cpuError : "Number of CPU cores, 2-" + availableCPU
              }
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              error={cpuError ? true : false}
            />
          )}

          {!editing ? (
            <Chip
              m={1}
              icon={<Iconify icon="bi:memory" width={24} height={24} />}
              label={
                <span>
                  Memory
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
              label="RAM"
              id="ram"
              value={specs.ram}
              onChange={(e) => calculateRAM(e.target.value)}
              size="small"
              helperText={
                ramError ? ramError : "Amount of RAM, 4-" + availableRAM + " GB"
              }
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              error={ramError ? true : false}
            />
          )}

          <Chip
            m={1}
            icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
            label={
              <span>
                Disk
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
          <Chip
            m={1}
            icon={
              <Iconify
                icon="material-symbols:speed-outline"
                width={24}
                height={24}
              />
            }
            label={
              <span>
                Network Speed
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {"1000 Mbps"}
                </b>
              </span>
            }
          />
        </Stack>
      </CardContent>

      <CardActions>
        {!editing && <Button onClick={() => setEditing(true)}>Edit</Button>}
        {editing && (
          <Button
            onClick={() => {
              setSpecs(vm.specs);
              setEditing(false);
              setCpuError(null);
              setRamError(null);
            }}
            color={"error"}
          >
            Cancel
          </Button>
        )}
        {editing && (
          <Button
            disabled={cpuError || ramError}
            onClick={() => applyChanges()}
          >
            Save
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
