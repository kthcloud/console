// @mui
import {
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";

import { getUser } from "src/api/deploy/users";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { createVM } from "src/api/deploy/vms";
import { Link } from "react-router-dom";
import RFC1035Input from "src/components/RFC1035Input";
import { faker } from "@faker-js/faker";

export default function CreateVm({ finished }) {
  const [cleaned, setCleaned] = useState("");

  const [publicKey, setPublicKey] = useState("");
  const [cpuCores, setCpuCores] = useState(2);
  const [diskSize, setDiskSize] = useState(20);
  const [ram, setRam] = useState(4);

  const { enqueueSnackbar } = useSnackbar();
  const { initialized, keycloak } = useKeycloak();
  const [user, setUser] = useState(null);

  const [cpuError, setCpuError] = useState(null);
  const [ramError, setRamError] = useState(null);
  const [diskError, setDiskError] = useState(null);

  const [availableCPU, setAvailableCPU] = useState(0);
  const [availableRAM, setAvailableRAM] = useState(0);
  const [availableDisk, setAvailableDisk] = useState(0);

  const [initialName, setInitialName] = useState(
    faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
  );

  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
      if (response.publicKeys.length > 0)
        setPublicKey(response.publicKeys[0].key);
    } catch (error) {
      enqueueSnackbar("Error fetching profile: " + error, { variant: "error" });
    }
  };

  useEffect(() => {
    loadProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  useEffect(() => {
    if (!user) return;

    setAvailableCPU(user.quota.cpuCores - user.usage.cpuCores);
    setAvailableRAM(user.quota.ram - user.usage.ram);
    setAvailableDisk(user.quota.diskSize - user.usage.diskSize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const calculateCPU = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setCpuCores("");
      setCpuError("Input a number, 2-" + availableCPU);
      return;
    }

    if (value > availableCPU) {
      setCpuError("Max CPU cores available: " + availableCPU);
      setCpuCores(value);
      return;
    }

    if (value < 2) {
      setCpuError("Minimum CPU cores: 2");
      setCpuCores(value);

      return;
    }

    setCpuError(null);
    setCpuCores(value);
  };

  const calculateRAM = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setRam("");
      setRamError("Input a number, 4-" + availableRAM);
      return;
    }

    if (value > availableRAM) {
      setRamError("Max RAM available: " + availableRAM);
      setRam(value);
      return;
    }

    if (value < 4) {
      setRamError("Minimum RAM: 4 GB");
      setRam(value);
      return;
    }

    setRamError(null);
    setRam(value);
  };

  const calculateDisk = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setDiskSize("");
      setDiskError("Input a number, 20-" + availableDisk);
      return;
    }

    if (value > availableDisk) {
      setDiskError("Max disk available: " + availableDisk);
      setDiskSize(value);
      return;
    }

    if (value < 20) {
      setDiskError("Minimum disk size: 20 GB");
      setDiskSize(value);
      return;
    }

    setDiskError(null);
    setDiskSize(value);
  };

  const verifyUserCanCreate = () => {
    if (!user) return false;
    if (availableCPU < 2) return false;
    if (availableRAM < 4) return false;
    if (availableDisk < 20) return false;
    return true;
  };

  const handleCreate = async (stay) => {
    if (!initialized) return;

    if (!cleaned || !publicKey || !cpuCores || !diskSize || !ram) {
      enqueueSnackbar("Please fill all fields", { variant: "error" });
      console.log(cleaned, publicKey, cpuCores, diskSize, ram);
      return;
    }

    try {
      const job = await createVM(
        cleaned,
        publicKey,
        cpuCores,
        diskSize,
        ram,
        keycloak.token
      );
      finished(job, stay);

      if (stay) {
        setInitialName(
          faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
        );
        setCleaned("");
        setCpuCores(2);
        setDiskSize(20);
        setRam(4);
      }
    } catch (e) {
      enqueueSnackbar("Error creating vm " + JSON.stringify(e), {
        variant: "error",
      });
    }
  };

  if (!verifyUserCanCreate())
    return (
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title="Create VM" />
        <CardContent>
          <Typography variant="body1">
            You do not have enough resources to create a VM. Please delete some
            other VMs or contact support.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title="Create VM" />
        <CardContent>
          <RFC1035Input
            label={"Name"}
            placeholder="name"
            callToAction="Your VM will be created with the name"
            type="VM Name"
            autofocus={true}
            variant="standard"
            cleaned={cleaned}
            setCleaned={setCleaned}
            initialValue={initialName}
          />

          {user && (
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="publickey-select-label">SSH Key</InputLabel>
              <Select
                defaultValue={
                  user.publicKeys.length > 0 && user.publicKeys[0].key
                }
                id="publickey"
                label="SSH Key"
                onChange={(e) => {
                  setPublicKey(e.target.value);
                }}
              >
                {user.publicKeys.map((key) => (
                  <MenuItem key={"ssh" + key.name} value={key.key}>
                    {key.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {" "}
                Don't have a key yet? Add one to your{" "}
                <Link to="/profile">profile</Link>.
              </FormHelperText>
            </FormControl>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card sx={{ boxShadow: 20 }}>
          <CardHeader title="Select specs" />
          <CardContent>
            <Stack
              spacing={3}
              direction={"row"}
              useFlexGap={true}
              flexWrap={"wrap"}
            >
              <TextField
                label="CPU Cores"
                id="cores"
                value={cpuCores}
                onChange={(e) => calculateCPU(e.target.value)}
                helperText={
                  cpuError ? cpuError : "Number of CPU cores, 2-" + availableCPU
                }
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                error={cpuError ? true : false}
              />

              <TextField
                label="RAM"
                id="ram"
                value={ram}
                onChange={(e) => calculateRAM(e.target.value)}
                helperText={
                  ramError ? ramError : "Amount of RAM in GB, 4-" + availableRAM
                }
                InputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  endAdornment: (
                    <InputAdornment position="end">GB</InputAdornment>
                  ),
                }}
                error={ramError ? true : false}
              />

              <TextField
                label="Disk Size"
                id="disk"
                value={diskSize}
                onChange={(e) => calculateDisk(e.target.value)}
                helperText={
                  diskError ? diskError : "Disk size in GB, 20-" + availableDisk
                }
                InputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  endAdornment: (
                    <InputAdornment position="end">GB</InputAdornment>
                  ),
                }}
                error={diskError ? true : false}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack
        justifyContent="flex-end"
        alignItems="center"
        direction="row"
        spacing={3}
      >
        <Typography variant="body2">
          You can attach a GPU in the next step.
        </Typography>

        <Button onClick={() => handleCreate(true)} variant="outlined">
          Create and stay
        </Button>

        <Button onClick={() => handleCreate(false)} variant="contained">
          Create
        </Button>
      </Stack>
    </>
  );
}
