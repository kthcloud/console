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
} from "@mui/material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "src/hooks/useResource";
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
import Iconify from "src/components/Iconify";
import { enqueueSnackbar } from "notistack";

export function Edit() {
  const { t } = useTranslation();
  const { initialized } = useKeycloak();
  const [resource, setResource] = useState(null);
  const [envs, setEnvs] = useState([]);
  const [persistent, setPersistent] = useState([]);
  const { user, rows, initialLoad, zones } = useResource();
  const [loaded, setLoaded] = useState(false);
  const [reloads, setReloads] = useState(0);

  const allowedTypes = ["vm", "deployment"];
  let { type, id } = useParams();
  const navigate = useNavigate();

  if (!allowedTypes.includes(type)) {
    navigate("/deploy");
  }

  const loadResource = () => {
    const row = rows.find((row) => row.id === id);
    if (!row) {
      setReloads(reloads + 1);
      if (reloads > 3) {
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
          {user.id !== resource.ownerId && (
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
                <Typography variant="h4">{resource.name}</Typography>

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
                        ).description
                      }
                      icon={<Iconify icon="mdi:earth" sx={{ opacity: 0.75 }} />}
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
                resource.deploymentType !== "prebuilt" &&
                !resource.integrations.includes("github") && (
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
