// mui
import {
  Card,
  CardContent,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  CardHeader,
  Button,
  Chip,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  DialogActions,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import useResource from "src/hooks/useResource";
import { useParams, useNavigate } from "react-router-dom";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
import LoadingPage from "../../components/LoadingPage";
import PortManager from "./PortManager";
import JobList from "../../components/JobList";

// api
import {
  deleteVM,
  attachGPU,
  updateVM,
  getGPUs,
  attachGPUById,
  applyCommand,
} from "src/api/deploy/vms";
import { deleteDeployment, updateDeployment } from "src/api/deploy/deployments";
import EnvManager from "./EnvManager";
import GHActions from "./GHActions";
import SSHString from "./SSHString";
import Specs from "./Specs";
import { GPUManager } from "./GPUManager";

export function Edit() {
  const { keycloak, initialized } = useKeycloak();
  const [resource, setResource] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [privateMode, setPrivateMode] = useState(false);
  const [envs, setEnvs] = useState([]);
  const [ports, setPorts] = useState([]);

  const [gpus, setGpus] = useState([]);
  const [gpuPickerOpen, setGpuPickerOpen] = useState(false);
  const [gpuChoice, setGpuChoice] = useState("");

  const { rows, initialLoad, queueJob } = useResource();
  const [loaded, setLoaded] = useState(false);

  const allowedTypes = ["vm", "deployment"];
  let { type, id } = useParams();
  const navigate = useNavigate();

  if (!allowedTypes.includes(type)) {
    navigate("/deploy");
  }

  const loadResource = () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;

    setResource(row);
    if (type === "deployment" && !loaded) {
      setPrivateMode(row.private);
      setEnvs(row.envs);
    }
    if (type === "vm" && !loaded) {
      setPorts(row.ports);
    }
    setLoaded(true);

    loadGPUs();
  };

  const loadGPUs = async () => {
    if (type === "vm" && userCanListGPUs) {
      const gpuRes = await getGPUs(keycloak.token);
      setGpus(gpuRes);
    }
  };

  // Update resource whenever rows changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadResource, [rows]);

  const deleteResource = async () => {
    try {
      let res = null;
      if (type === "vm") res = await deleteVM(id, keycloak.token);
      if (type === "deployment")
        res = await deleteDeployment(id, keycloak.token);

      if (res) {
        queueJob(res);
        enqueueSnackbar("Resource deleting... ", { variant: "info" });
        navigate("/deploy");
      }
    } catch (err) {
      enqueueSnackbar(err, { variant: "error" });
    }
  };

  const updateResource = async () => {
    if (type === "deployment") {
      try {
        const res = await updateDeployment(
          id,
          envs,
          privateMode,
          keycloak.token
        );
        queueJob(res);
      } catch (err) {
        enqueueSnackbar("Could not update resource " + JSON.stringify(err), {
          variant: "error",
        });
      }
    } else if (type === "vm") {
      try {
        const res = await updateVM(id, ports, 2, 2, keycloak.token);
        queueJob(res);
      } catch (err) {
        enqueueSnackbar("Could not update resource " + JSON.stringify(err), {
          variant: "error",
        });
      }
    }
  };

  const executeCommand = async (command) => {
    try {
      await applyCommand(id, command, keycloak.token);
      enqueueSnackbar(sentenceCase(command) + "ing... ", { variant: "info" });
    } catch (err) {
      enqueueSnackbar("Could not execute command " + JSON.stringify(err), {
        variant: "error",
      });
    }
  };

  const userCanListGPUs = () => {
    if (!initialized) return false;
    if (!keycloak) return false;
    if (!keycloak.authenticated) return false;

    keycloak.loadUserInfo();

    if (!keycloak.userInfo) return false;

    if (!Object.hasOwn(keycloak.userInfo, "groups")) return false;
    return keycloak.userInfo.groups.includes("powerUser");
  };

  return (
    <>
      {!(resource && initialLoad && initialized) ? (
        <LoadingPage />
      ) : (
        <Page title={"Editing " + resource.name}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {resource.name}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={"Details"} />
                <CardContent>
                  <Stack spacing={3}>
                    <TextField
                      label="Name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle />
                          </InputAdornment>
                        ),
                      }}
                      variant="standard"
                      value={resource.name}
                    />

                    <Stack
                      direction="row"
                      flexWrap={"wrap"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      spacing={3}
                      useFlexGap={true}
                    >
                      <Chip label={sentenceCase(resource.status)} />

                      <div style={{ flexGrow: "1" }} />

                      <Button
                        onClick={updateResource}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="material-symbols:save" />}
                      >
                        Save changes
                      </Button>

                      {resource.type === "deployment" && (
                        <Button
                          onClick={deleteResource}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:nuke" />}
                          color="error"
                        >
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {resource.type === "vm" && (
                <Card sx={{ boxShadow: 20 }}>
                  <CardHeader
                    title={"Danger zone"}
                    subheader={"Actions may be irreversible"}
                  />
                  <CardContent>
                    <Stack
                      direction="row"
                      flexWrap={"wrap"}
                      alignItems={"center"}
                      spacing={3}
                      useFlexGap={true}
                    >
                      {resource.status !== "resourceStopped" && (
                        <Button
                          onClick={() => executeCommand("stop")}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:shutdown" />}
                          color="warning"
                        >
                          Stop
                        </Button>
                      )}
                      {resource.status === "resourceRunning" && (
                        <Button
                          onClick={() => executeCommand("reboot")}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:restart" />}
                          color="warning"
                        >
                          Reboot
                        </Button>
                      )}
                      {resource.status !== "resourceRunning" && (
                        <Button
                          onClick={() => executeCommand("start")}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:shutdown" />}
                          color="warning"
                        >
                          Start
                        </Button>
                      )}

                      <>
                        <Button
                          onClick={async () => {
                            if (userCanListGPUs() && !resource.gpu) {
                              setGpuPickerOpen(true);
                              return;
                            }

                            try {
                              const res = await attachGPU(
                                resource,
                                keycloak.token
                              );
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
                          disabled={resource.status !== "resourceRunning"}
                          color={!resource.gpu ? "primary" : "warning"}
                        >
                          {!resource.gpu ? "Lease GPU" : "End GPU Lease"}
                        </Button>
                        <Dialog
                          open={gpuPickerOpen}
                          onClose={() => setGpuPickerOpen(false)}
                        >
                          <DialogTitle>Attach GPU</DialogTitle>
                          <DialogContent>
                            <DialogContentText>
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
                                      resource,
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
                                      "Could not attach GPU " +
                                        JSON.stringify(e),
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

                      <Button
                        onClick={deleteResource}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="mdi:nuke" />}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {resource.type === "vm" && <Specs vm={resource} />}

              {resource.type === "vm" && resource.gpu && (
                <GPUManager vm={resource} />
              )}

              {resource.type === "vm" && (
                <Card sx={{ boxShadow: 20 }}>
                  <CardHeader title={"Port forwarding"} />
                  <CardContent>
                    <PortManager
                      resource={resource}
                      ports={ports}
                      setPorts={setPorts}
                    />
                  </CardContent>
                </Card>
              )}

              {resource.type === "vm" && <SSHString resource={resource} />}

              {resource.type === "deployment" && (
                <Card sx={{ boxShadow: 20 }}>
                  <CardHeader title={"Environment variables"} />
                  <CardContent>
                    <EnvManager
                      resource={resource}
                      envs={envs}
                      setEnvs={setEnvs}
                    />
                  </CardContent>
                </Card>
              )}

              {resource.type === "deployment" && (
                <Card sx={{ boxShadow: 20 }}>
                  <CardHeader
                    title={"Visibility"}
                    subheader={
                      "Choose whether to make this deployment accessible from the internet."
                    }
                  />

                  <CardContent>
                    <FormControlLabel
                      control={
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privateMode}
                              onChange={(e) => setPrivateMode(e.target.checked)}
                            />
                          }
                          label="Private"
                          labelPlacement="end"
                          sx={{ ml: 1 }}
                        />
                      }
                      label="Public"
                      labelPlacement="start"
                    />
                  </CardContent>
                </Card>
              )}

              {resource.type === "deployment" && (
                <GHActions resource={resource} />
              )}
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
