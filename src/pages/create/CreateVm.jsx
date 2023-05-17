// @mui
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Card,
  CardHeader,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Iconify from "../../components/Iconify";

import { getUser } from "src/api/deploy/users";
import { useKeycloak } from "@react-keycloak/web";
import useAlert from "src/hooks/useAlert";
import { createVM } from "src/api/deploy/vms";

export default function CreateVm({ finished }) {
  const [name, setName] = useState("");
  const [cleaned, setCleaned] = useState("");
  const [content, setContent] = useState("");

  const [publicKey, setPublicKey] = useState("");
  const [cpuCores, setCpuCores] = useState("");
  const [diskSize, setDiskSize] = useState("");
  const [ram, setRam] = useState("");

  const { setAlert } = useAlert();
  const { initialized, keycloak } = useKeycloak();
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      setAlert("Error fetching profile: " + error, "error");
    }
  };
  useEffect(() => {
    loadProfile();
  }, [initialized]);

  const handleCreate = async (stay) => {
    if (!initialized) return;

    if (!name || !cleaned || !publicKey || !cpuCores || !diskSize || !ram) {
      setAlert("Please fill all fields", "error");
      console.log(name, cleaned, publicKey, cpuCores, diskSize, ram)
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
        setName("");
        setContent("");
        setCleaned("");
        setPublicKey("");
        setCpuCores("");
        setDiskSize("");
        setRam("");
      }
    } catch (e) {
      setAlert("Error creating vm " + JSON.stringify(e), "error");
    }
  };

  const clean = (name) => {
    name = name.toLowerCase();
    // convert name to RFC 1035
    name = name.replace(/[^a-z0-9-]/g, "-");
    name = name.replace(/-+/g, "-");
    name = name.replace(/^-|-$/g, "");
    // trim to 30 characters
    name = name.substring(0, 30);
    // convert name to RFC 1035
    name = name.replace(/[^a-z0-9-]/g, "-");
    name = name.replace(/-+/g, "-");
    name = name.replace(/^-|-$/g, "");

    setCleaned(name);
  };

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title="Create VM" />
        <CardContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="vmName"
            label="Name"
            variant="standard"
            value={name}
            helperText={
              <span>
                Deployment names must follow{" "}
                <a
                  href="https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names"
                  target="_blank"
                  rel="noreferrer"
                >
                  RFC 1035
                </a>{" "}
                and must not include dots.
              </span>
            }
            onChange={(e) => {
              setName(e.target.value);
              clean(e.target.value);
            }}
          />
          {cleaned !== "" && (
            <DialogContentText sx={{ mt: 3 }}>
              Your VM will be created with the name <strong>{cleaned}</strong>
            </DialogContentText>
          )}

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
