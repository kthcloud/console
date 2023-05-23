// @mui
import {
  Button,
  TextField,
  DialogContentText,
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
} from "@mui/material";
import { useEffect, useState } from "react";

import { getUser } from "src/api/deploy/users";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { createVM } from "src/api/deploy/vms";
import { Link } from "react-router-dom";
import RFC1035Input from "src/components/RFC1035Input";

export default function CreateVm({ finished }) {
  const [cleaned, setCleaned] = useState("");

  const [publicKey, setPublicKey] = useState("");
  const [cpuCores, setCpuCores] = useState("");
  const [diskSize, setDiskSize] = useState("");
  const [ram, setRam] = useState("");

  const { enqueueSnackbar } = useSnackbar();
  const { initialized, keycloak } = useKeycloak();
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      enqueueSnackbar("Error fetching profile: " + error, { variant: "error" });
    }
  };
  useEffect(() => {
    loadProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

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
        setCleaned("");
        setPublicKey("");
        setCpuCores("");
        setDiskSize("");
        setRam("");
      }
    } catch (e) {
      enqueueSnackbar("Error creating vm " + JSON.stringify(e), {
        variant: "error",
      });
    }
  };

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
          />

          {user && (
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="publickey-select-label">SSH Key</InputLabel>
              <Select
                defaultValue=""
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
                Don't have a key yet? Upload one in your{" "}
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
            <FormControl fullWidth>
              <InputLabel id="cpu-select-label">CPU Cores</InputLabel>
              <Select
                defaultValue=""
                id="cpu-select"
                label="CPU Cores"
                onChange={(e) => {
                  setCpuCores(e.target.value);
                }}
              >
                {[...Array(user.quota.cpuCores - user.usage.cpuCores)].map(
                  (x, i) => (
                    <MenuItem key={"cpu" + i} value={i + 1}>
                      {i + 1 + " cores"}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="ram-select-label">System memory</InputLabel>
              <Select
                defaultValue=""
                id="ram-select"
                label="System memory"
                onChange={(e) => {
                  setRam(e.target.value);
                }}
              >
                {[...Array(user.quota.ram - user.usage.ram)].map((x, i) => (
                  <MenuItem key={"ram" + i} value={i + 1}>
                    {i + 1 + " GB"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="disk-select-label">Disk size</InputLabel>
              <Select
                defaultValue=""
                id="disk-select"
                label="Disk size"
                onChange={(e) => {
                  setDiskSize(e.target.value);
                }}
              >
                {[...Array(user.quota.diskSize - user.usage.diskSize)].map(
                  (x, i) => (
                    <MenuItem key={"disk" + i} value={i + 1}>
                      {i + 1 + " GB"}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
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
