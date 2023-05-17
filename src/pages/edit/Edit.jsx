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
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useAlert from "src/hooks/useAlert";
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
import { deleteVM, attachGPU, updateVM } from "src/api/deploy/vms";
import { deleteDeployment, updateDeployment } from "src/api/deploy/deployments";
import EnvManager from "./EnvManager";
import GHActions from "./GHActions";
import SSHString from "./SSHString";

export function Edit() {
  const { keycloak, initialized } = useKeycloak();
  const [resource, setResource] = useState(null);
  const { setAlert } = useAlert();
  const [privateMode, setPrivateMode] = useState(false);
  const [envs, setEnvs] = useState([]);
  const [ports, setPorts] = useState([]);

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
    if (type == "deployment" && !loaded) {
      setPrivateMode(row.private);
      setEnvs(row.envs);
    }
    if (type == "vm" && !loaded) {
      setPorts(row.ports);
    }
    setLoaded(true);
  };

  // Update resource whenever rows changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadResource, [rows]);

  const deleteResource = async () => {
    try {
      if (type === "vm") queueJob( await deleteVM(id, keycloak.token));
      if (type === "deployment") queueJob(await deleteDeployment(id, keycloak.token));
    } catch (err) {
      setAlert("Could not delete resource " + JSON.stringify(err), "error");
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
        setAlert("Could not update resource " + JSON.stringify(err), "error");
      }
    }else if (type === "vm") {
      try {
        const res = await updateVM(
          id,
          ports,
          2,
          2,
          keycloak.token
        );
        queueJob(res);
      } catch (err) {
        setAlert("Could not update resource " + JSON.stringify(err), "error");
      }
    }
  };

  return (
    <>
      {!(resource && initialLoad && initialized) ? (
        <LoadingPage />
      ) : (
        <Page title="Profile">
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

                    {resource.type === "vm" && resource.gpu && (
                      <TextField
                        label="GPU"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="mdi:gpu" />
                            </InputAdornment>
                          ),
                        }}
                        variant="standard"
                        value={"NVIDIA " + resource.gpu.name}
                        disabled
                      />
                    )}

                    <Stack
                      direction="row"
                      flexWrap={"wrap"}
                      alignItems={"center"}
                    >
                      <Chip label={sentenceCase(resource.status)} />

                      <div style={{ flexGrow: "1" }} />

                      {resource.type === "vm" && (
                        <Button
                          onClick={async () => {
                            try {
                              const res = await attachGPU(
                                resource,
                                keycloak.token
                              );
                              queueJob(res);
                            } catch (e) {
                              setAlert(
                                "Could not attach GPU " + JSON.stringify(e),
                                "error"
                              );
                            }
                          }}
                          variant="contained"
                          to="#"
                          startIcon={<Iconify icon="mdi:gpu" />}
                          sx={{ m: 1 }}
                        >
                          {!resource.gpu ? "Attach GPU" : "Detach GPU"}
                        </Button>
                      )}
                      <Button
                        onClick={updateResource}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="material-symbols:save" />}
                        sx={{ m: 1 }}
                      >
                        Save changes
                      </Button>

                      <Button
                        onClick={deleteResource}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="mdi:nuke" />}
                        sx={{ m: 1 }}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

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
