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
  const [gpuLoading, setGpuLoading] = useState(false);

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
    setGpuLoading(false);
  }, [vm.gpu]);

  useEffect(() => {
    loadGPUs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGPUs = async () => {
    if (userCanListGPUs) {
      const gpuRes = await getGPUs(keycloak.token);

      // sort by name
      gpuRes.sort((a, b) => {
        if (a.name < b.name) return 1;
        if (a.name > b.name) return -1;
        return hashGPUId(a.id) < hashGPUId(b.id) ? -1 : 1;
      });

      setGpus(gpuRes);
    }
  };

  const hashGPUId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0; // |0 is used to convert to 32bit integer
    }
    hash = Math.abs(hash) % 10000; // Ensure that the hash is a 4 digit number
    return "#" + String(hash).padStart(4, "0"); // Format the hash with leading zeroes if required
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

            {gpuLoading && <Skeleton height={"2rem"} sx={{ width: "50%" }} />}

            {!(gpuPickerOpen || gpuLoading) && (
              <Button
                onClick={async () => {
                  if (userCanListGPUs() && !vm.gpu) {
                    setGpuPickerOpen(true);
                    return;
                  }

                  try {
                    setGpuLoading(true);
                    const res = await attachGPU(vm, keycloak.token);
                    queueJob(res);
                  } catch (e) {
                    setGpuLoading(false);
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
                disabled={
                  !(
                    vm.status === "resourceRunning" ||
                    vm.status === "resourceStopped"
                  )
                }
              >
                {!vm.gpu ? "Lease GPU" : "End GPU Lease"}
              </Button>
            )}
            {gpuPickerOpen && (
              <>
                {gpus.length === 0 ? (
                  <Skeleton height={"5rem"} />
                ) : (
                  <FormControl fullWidth>
                    <InputLabel id="gpu-picker-label">GPU</InputLabel>
                    <Select
                      labelId="gpu-picker-label"
                      id="gpu-picker"
                      value={gpuChoice}
                      onChange={(e) => setGpuChoice(e.target.value)}
                      label="GPU"
                      fullWidth
                      defaultOpen
                    >
                      {gpus.map((gpu, index) => (
                        <MenuItem
                          key={gpu.id}
                          value={gpu.id}
                          sx={() => {
                            if (index % 2 === 0)
                              return { backgroundColor: "#eee" };
                          }}
                          disabled={Boolean(gpu.lease)}
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

                            {gpu.lease && gpu.lease.end && (
                              <Chip
                                label={
                                  <span>
                                    Leased until
                                    <b
                                      style={{
                                        fontFamily: "monospace",
                                        marginLeft: ".5em",
                                      }}
                                    >
                                      {new Date(gpu.lease.end).toLocaleString(
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
                  <Button onClick={() => setGpuPickerOpen(false)} color="error">
                    Cancel
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
                        enqueueSnackbar("GPU attached", {
                          variant: "success",
                        });
                      } catch (e) {
                        setGpuLoading(false);
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
                </Stack>
              </>
            )}
          </Stack>

          <Typography variant="body2">
            Leasing a GPU allows you to use it for a limited time.
            You will need to install the drivers and software yourself.
            <br />
            On Ubuntu, run{" "}
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
            to install the latest drivers.
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
