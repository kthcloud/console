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
  DialogActions,
  DialogContentText,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { attachGPU, getGPUs, attachGPUById } from "src/api/deploy/vms";

export const GPUManager = ({ vm }) => {
  const { keycloak, initialized } = useKeycloak();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();

  const [gpus, setGpus] = useState([]);
  const [gpuPickerOpen, setGpuPickerOpen] = useState(false);
  const [gpuChoice, setGpuChoice] = useState("");

  const userCanListGPUs = () => {
    if (!initialized) return false;
    if (!keycloak) return false;
    if (!keycloak.authenticated) return false;

    keycloak.loadUserInfo();

    if (!keycloak.userInfo) return false;

    if (!Object.hasOwn(keycloak.userInfo, "groups")) return false;
    return keycloak.userInfo.groups.includes("powerUser");
  };

  useEffect(() => {
    loadGPUs();
  }, []);

  const loadGPUs = async () => {
    if (userCanListGPUs) {
      const gpuRes = await getGPUs(keycloak.token);
      setGpus(gpuRes);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={"GPU Lease"} />
      <CardContent>
        <Stack spacing={3} direction={"column"} useFlexGap={true}>
          <Stack
            spacing={3}
            direction={"row"}
            flexWrap={"wrap"}
            useFlexGap={true}
            alignItems={"center"}
          >
            {vm.gpu && (
              <Chip
                m={1}
                icon={<Iconify icon="mdi:gpu" width={24} height={24} />}
                label={"NVIDIA " + vm.gpu.name}
              />
            )}

            {vm.gpu && (
              <Chip
                m={1}
                icon={
                  <Iconify icon="mdi:clock-outline" width={24} height={24} />
                }
                label={
                  <span>
                    Leased until
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
            <>
              <Button
                onClick={async () => {
                  if (userCanListGPUs() && !vm.gpu) {
                    setGpuPickerOpen(true);
                    return;
                  }

                  try {
                    const res = await attachGPU(vm, keycloak.token);
                    queueJob(res);
                  } catch (e) {
                    enqueueSnackbar(
                      "Could not attach GPU " + JSON.stringify(e),
                      { variant: "error" }
                    );
                  }
                }}
                variant="contained"
                to="#"
                startIcon={<Iconify icon="mdi:gpu" />}
                color={!vm.gpu ? "primary" : "warning"}
              >
                {!vm.gpu ? "Lease GPU" : "End GPU Lease"}
              </Button>
              <Dialog
                open={gpuPickerOpen}
                onClose={() => setGpuPickerOpen(false)}
              >
                <DialogTitle>Lease GPU</DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{mb: 3}}>
                    Select a GPU to attach to this VM.
                  </DialogContentText>
                  <FormControl fullWidth>
                    <InputLabel id="gpu-picker-label">GPU</InputLabel>
                    <Select
                      labelId="gpu-picker-label"
                      id="gpu-picker"
                      value={gpuChoice}
                      onChange={(e) => setGpuChoice(e.target.value)}
                      label="GPU"
                      fullWidth
                    >
                      {gpus.map((gpu) => (
                        <MenuItem key={gpu.id} value={gpu.id}>
                          {gpu.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DialogActions>
                    <Button
                      onClick={() => setGpuPickerOpen(false)}
                      color="error"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await attachGPUById(
                            vm,
                            keycloak.token,
                            gpuChoice
                          );
                          queueJob(res);
                          setGpuPickerOpen(false);
                          setGpuChoice("");
                          enqueueSnackbar("GPU attached", {
                            variant: "success",
                          });
                        } catch (e) {
                          enqueueSnackbar(
                            "Could not attach GPU " + JSON.stringify(e),
                            { variant: "error" }
                          );
                        }
                      }}
                      color="primary"
                    >
                      Attach
                    </Button>
                  </DialogActions>
                </DialogContent>
              </Dialog>
            </>
          </Stack>

          <Typography variant="body2">
            Leasing a GPU allow you to use it allocate it for a limited time. You will need to
            install the drivers and software yourself.
            <br />
            For Ubuntu VMs,{" "}
            <CopyToClipboard text="sudo ubuntu-drivers install --gpgpu">
              <Tooltip title="Copy to clipboard">
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  sudo ubuntu-drivers install --gpgpu
                </span>
              </Tooltip>
            </CopyToClipboard>{" "}
            can be used to install drivers.{" "}
            <Link
              href="https://help.ubuntu.com/community/NvidiaDriversInstallation"
              target="_blank"
              rel="noreferrer"
              ml={1}
            >
              Learn more
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
