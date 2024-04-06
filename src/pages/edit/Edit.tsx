// mui
import {
  Container,
  Typography,
  Stack,
  Toolbar,
  Box,
  Button,
  AppBar,
  Chip,
  IconButton,
  FormControl,
  OutlinedInput,
  InputAdornment,
  useTheme,
} from "@mui/material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "../../hooks/useResource";
import { useParams, useNavigate } from "react-router-dom";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import LoadingPage from "../../components/LoadingPage";
import PortManager from "./vms/PortManager";
import JobList from "../../components/JobList";

// api
import EnvManager from "./deployments/EnvManager";
import GHActions from "./deployments/GHActions";
import SSHString from "./vms/SSHString";
import Specs from "./vms/Specs";
import SnapshotManager from "./vms/SnapshotManager";
import { GPUManager } from "./vms/GPUManager";
import { PrivateMode } from "./deployments/PrivateMode";
import { DeploymentCommands } from "./deployments/DeploymentCommands";
import { VMCommands } from "./vms/VMCommands";
import { LogsView } from "./deployments/LogsView";
import { getReasonPhrase } from "http-status-codes";
import StorageManager from "./deployments/StorageManager";
import { ImageManager } from "./deployments/ImageManager";
import { DomainManager } from "./deployments/DomainManager";
import ProxyManager from "./vms/ProxyManager";
import { HealthCheckRoute } from "./deployments/HealthCheckRoute";
import { useTranslation } from "react-i18next";
import DangerZone from "./DangerZone";
import { ReplicaManager } from "./deployments/ReplicaManager";
import Iconify from "../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import { updateDeployment } from "../../api/deploy/deployments";
import { updateVM } from "../../api/deploy/vms";
import { errorHandler } from "../../utils/errorHandler";

export function Edit() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const theme = useTheme();

  const { queueJob, beginFastLoad } = useResource();

  const [resource, setResource] = useState(null);
  const [envs, setEnvs] = useState([]);
  const [persistent, setPersistent] = useState([]);

  const [editingName, setEditingName] = useState(false);
  const [nameFieldValue, setNameFieldValue] = useState("");

  const {
    user,
    rows,
    initialLoad,
    zones,
    impersonatingVm,
    impersonatingDeployment,
  } = useResource();
  const [loaded, setLoaded] = useState(false);
  const [reloads, setReloads] = useState(0);

  const allowedTypes = ["vm", "deployment"];
  let { type, id } = useParams();
  const navigate = useNavigate();

  if (!allowedTypes.includes(type)) {
    navigate("/deploy");
  }

  const handleNameChange = async () => {
    setEditingName(false);

    if (!initialized && resource) {
      enqueueSnackbar(t("error-updating"), { variant: "error" });
      return;
    }

    if (nameFieldValue.trim() === "") {
      enqueueSnackbar(t("name-cannot-be-empty"), { variant: "error" });
      return;
    }

    try {
      let result = "";
      if (resource.type === "deployment") {
        result = await updateDeployment(
          resource.id,
          { name: nameFieldValue },
          keycloak.token
        );
      } else if (resource.type === "vm") {
        result = await updateVM(
          resource.id,
          { name: nameFieldValue },
          keycloak.token
        );
      }

      if (result) {
        queueJob(result);
        beginFastLoad();
        enqueueSnackbar(t("saving-name"), { variant: "info" });
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-updating") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadResource = () => {
    const row = rows.find((row) => row.id === id);
    if (!row) {
      setReloads(reloads + 1);
      if (reloads > 10) {
        enqueueSnackbar(t("resource-not-found"), { variant: "error" });
        navigate("/deploy");
      }
      return;
    }

    setResource(row);
    if (type === "deployment" && !loaded) {
      setEnvs(row.envs);
      setPersistent(row.volumes);
    }
    setLoaded(true);
  };

  // Update resource whenever rows changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadResource, [rows]);

  return (
    <>
      {!(resource && initialLoad && initialized) ? (
        <LoadingPage />
      ) : (
        <Page title={t("editing") + " " + resource.name}>
          {(resource.id === impersonatingVm ||
            resource.id === impersonatingDeployment) && (
            <AppBar
              position="fixed"
              color="error"
              sx={{
                top: "auto",
                bottom: 0,
              }}
            >
              <Toolbar>
                <Typography variant="h4">
                  {t("you-are-impersonating-user") + " " + resource.ownerId}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" alignItems={"center"} spacing={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/admin")}
                    style={{ color: "white", borderColor: "white" }}
                  >
                    {t("back-to-admin-panel")}
                  </Button>
                </Stack>
              </Toolbar>
            </AppBar>
          )}

          <Container>
            <Stack spacing={3}>
              <Stack
                direction="row"
                flexWrap={"wrap"}
                alignItems={"center"}
                justifyContent={"space-between"}
                spacing={3}
                useFlexGap={true}
              >
                {!editingName && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4">{resource.name}</Typography>
                    <IconButton
                      onClick={() => {
                        setEditingName(!editingName);
                        setNameFieldValue(resource.name);
                      }}
                      sx={{ color: theme.palette.grey[500] }}
                    >
                      <Iconify icon="mdi:pencil" />
                    </IconButton>
                  </Stack>
                )}
                {editingName && (
                  <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                    <OutlinedInput
                      id="outlined-adornment-weight"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={handleNameChange}>
                            <Iconify icon="mdi:content-save" />
                          </IconButton>
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        "aria-label": "weight",
                      }}
                      value={nameFieldValue}
                      onChange={(e) => {
                        setNameFieldValue(e.target.value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameChange();
                      }}
                      autoFocus
                    />
                  </FormControl>
                )}

                <Stack
                  direction="row"
                  flexWrap={"wrap"}
                  alignItems={"center"}
                  spacing={3}
                  useFlexGap={true}
                >
                  {resource.status && (
                    <Chip
                      label={sentenceCase(
                        resource.status.replace("resource", "").trim()
                      )}
                      icon={
                        <Iconify
                          icon="tabler:heartbeat"
                          sx={{ opacity: 0.75 }}
                        />
                      }
                      sx={
                        resource.status === "resourceStopping" ||
                        resource.status === "resourceStarting" ||
                        resource.status === "resourceRestarting"
                          ? {
                              animation:
                                "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
                            }
                          : null
                      }
                    />
                  )}
                  {resource.pingResult && (
                    <Chip
                      label={
                        sentenceCase(resource.pingResult.toString()) +
                        " " +
                        getReasonPhrase(resource.pingResult)
                      }
                      icon={
                        <Iconify
                          icon="mdi:transit-connection-variant"
                          sx={{ opacity: 0.75 }}
                        />
                      }
                    />
                  )}
                  {resource.zone && zones && (
                    <Chip
                      label={
                        zones.find(
                          (zone) =>
                            zone.name === resource.zone &&
                            zone.type === resource.type
                        )?.description
                      }
                      icon={<Iconify icon="mdi:earth" sx={{ opacity: 0.75 }} />}
                    />
                  )}
                  {resource?.teams?.length > 0 && (
                    <Chip
                      label={t("shared")}
                      icon={
                        <Iconify
                          icon="mdi:account-multiple"
                          sx={{ opacity: 0.75 }}
                        />
                      }
                    />
                  )}
                </Stack>
                <div style={{ flexGrow: "1" }} />

                {resource.type === "deployment" && (
                  <DeploymentCommands deployment={resource} />
                )}

                {resource.type === "vm" && <VMCommands vm={resource} />}
              </Stack>

              <JobList />

              {resource.type === "vm" && <SSHString resource={resource} />}

              {resource.type === "vm" && <GPUManager vm={resource} />}

              {resource.type === "vm" && <SnapshotManager vm={resource} />}

              {resource.type === "vm" && <PortManager vm={resource} />}

              {resource.type === "vm" && <ProxyManager vm={resource} />}

              {resource.type === "vm" && <Specs vm={resource} />}

              {resource.type === "deployment" && (
                <EnvManager
                  deployment={resource}
                  envs={envs}
                  setEnvs={setEnvs}
                />
              )}

              {resource.type === "deployment" && (
                <StorageManager
                  deployment={resource}
                  persistent={persistent}
                  setPersistent={setPersistent}
                />
              )}

              {resource.type === "deployment" && (
                <PrivateMode deployment={resource} />
              )}

              {resource.type === "deployment" &&
                resource.deploymentType === "prebuilt" && (
                  <ImageManager deployment={resource} />
                )}

              {resource.type === "deployment" &&
                user?.role?.permissions.includes("useCustomDomains") && (
                  <DomainManager deployment={resource} />
                )}

              {resource.type === "deployment" &&
                resource.deploymentType !== "prebuilt" && (
                  <GHActions resource={resource} />
                )}

              {resource.type === "deployment" && (
                <ReplicaManager deployment={resource} />
              )}
              {resource.type === "deployment" && (
                <LogsView deployment={resource} />
              )}

              {resource.type === "deployment" && (
                <HealthCheckRoute deployment={resource} />
              )}

              <DangerZone resource={resource} />
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
