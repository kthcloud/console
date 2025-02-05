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
  useTheme,
  Tooltip,
} from "@mui/material";
import { useState, useEffect, ReactNode } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "../../hooks/useResource";
import { useParams, useNavigate } from "react-router-dom";
import { sentenceCase } from "change-case";
import Page from "../../components/Page";
import LoadingPage from "../../components/LoadingPage";
import PortManager from "./vms/PortManager";
import JobList from "../../components/JobList";
import EnvManager from "./deployments/EnvManager";
import GHActions from "./deployments/GHActions";
import SSHString from "./vms/SSHString";
import { GPUManager } from "./vms/GPUManager";
import { PrivateMode } from "./deployments/PrivateMode";
import { DeploymentCommands } from "./deployments/DeploymentCommands";
import { VMCommands } from "./vms/VMCommands";
import { LogsView } from "./deployments/LogsView";
import { getReasonPhrase } from "http-status-codes";
import StorageManager from "./deployments/StorageManager";
import { ImageManager } from "./deployments/ImageManager";
import { DomainManager } from "./deployments/DomainManager";
import { HealthCheckRoute } from "./deployments/HealthCheckRoute";
import { useTranslation } from "react-i18next";
import DangerZone from "./DangerZone";
import Iconify from "../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import { updateDeployment } from "../../api/deploy/deployments";
import { updateVM } from "../../api/deploy/vms";
import { errorHandler } from "../../utils/errorHandler";
import { Job, Resource, Deployment, Vm } from "../../types";
import { Volume } from "@kthcloud/go-deploy-types/types/v2/body";
import { AlertList } from "../../components/AlertList";
import { Specs } from "./Specs";
import { ReplicaStatus } from "./deployments/ReplicaStatus";
import ProxyManager from "./vms/ProxyManager";
import { isOlderThanThreeMonths } from "../../components/render/Resource";
import Label from "../../components/Label";
import { getDaysLeftUntilStale } from "../../utils/staleDates";
import NeverStaleMode from "./NeverStaleMode";

export function Edit() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const theme = useTheme();
  const {
    user,
    rows,
    initialLoad,
    zones,
    impersonatingVm,
    impersonatingDeployment,
    queueJob,
    beginFastLoad,
  } = useResource();
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [persistent, setPersistent] = useState<Volume[]>([]);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [nameFieldValue, setNameFieldValue] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false);
  const [reloads, setReloads] = useState<number>(0);

  const allowedTypes = ["vm", "deployment"];
  if (type && !allowedTypes.includes(type)) {
    navigate("/deploy");
  }

  const handleNameChange = async () => {
    setEditingName(false);

    if (!(initialized && resource && keycloak.token)) {
      enqueueSnackbar(t("error-updating"), { variant: "error" });
      return;
    }

    if (nameFieldValue.trim() === "") {
      enqueueSnackbar(t("name-cannot-be-empty"), { variant: "error" });
      return;
    }

    try {
      let result: Job | null = null;
      if (resource.type === "deployment") {
        result = await updateDeployment(
          resource.id,
          { name: nameFieldValue },
          keycloak.token
        );
      } else if (resource.type === "vm") {
        result = await updateVM(keycloak.token, resource.id, {
          name: nameFieldValue,
        });
      }

      if (result) {
        queueJob(result);
        beginFastLoad();
        enqueueSnackbar(t("saving-name"), { variant: "info" });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-updating") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  const handleCloseChange = () => {
    setEditingName(false);
    setNameFieldValue(resource?.name || "");
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
    if (row.type === "deployment" && !loaded) {
      setPersistent((row as Deployment).volumes);
    }
    setLoaded(true);
  };

  // Update resource whenever rows changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadResource, [rows]);

  const renderPingResult = (resource: Deployment): ReactNode => {
    if (!resource.pingResult) return null;
    return (
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
    );
  };
  const renderResourceStatus = (resource: Resource) => {
    if (!resource.status) return null;
    return (
      <Chip
        label={
          resource.type === "deployment" && resource.error ? (
            <Tooltip enterTouchDelay={10} title={resource.error}>
              <span>
                {sentenceCase(resource.status.replace("resource", "").trim())}
              </span>
            </Tooltip>
          ) : (
            sentenceCase(resource.status.replace("resource", "").trim())
          )
        }
        icon={<Iconify icon="tabler:heartbeat" sx={{ opacity: 0.75 }} />}
        sx={
          resource.status === "resourceStopping" ||
          resource.status === "resourceStarting" ||
          resource.status === "resourceRestarting"
            ? {
                animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
              }
            : null
        }
      />
    );
  };
  const renderStaleResourceHeaderFullWidth = (resource: Resource) => {
    const warningDaysBeforeStale = 30;
    const daysLeftUntilStale = getDaysLeftUntilStale(resource?.accessedAt);
    const stale =
      typeof daysLeftUntilStale === "number"
        ? daysLeftUntilStale <= 0
        : isOlderThanThreeMonths(resource?.accessedAt);

    if (
      resource.neverStale ||
      (!stale &&
        (daysLeftUntilStale === false ||
          (daysLeftUntilStale as number) > warningDaysBeforeStale))
    )
      return <></>;

    // Styles for the icon and header
    const boxStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    };

    return (
      <Label
        variant="ghost"
        color={!stale ? "info" : "warning"}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "0.5em",
        }}
      >
        <div style={boxStyles}>
          <Iconify
            icon={!stale ? "mdi:hourglass" : "mdi:hourglass-full"}
            sx={{ opacity: 0.65 }}
          />
          <Typography variant="h6">
            {!stale ? t("stale-soon") : t("stale")}
          </Typography>
        </div>
        <Typography
          variant="body2"
          ml={"1.5em"}
          sx={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          {stale
            ? t("stale-description") +
              (resource.status === "resourceDisabled" ||
              resource.status === "resourceStopped"
                ? " " + t("stale-and-disabled-description")
                : " " + t("stale-and-not-disabled-description"))
            : t("stale-soon-description") +
              ` (${daysLeftUntilStale} ${t("days-left")})`}
        </Typography>
      </Label>
    );
  };

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
                <Box component="div" sx={{ flexGrow: 1 }} />
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
                {!editingName ? (
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
                ) : (
                  <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                    <OutlinedInput
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
                  {editingName ? (
                    <>
                      <IconButton onClick={handleNameChange}>
                        <Iconify icon="mdi:content-save" />
                      </IconButton>
                      <IconButton onClick={handleCloseChange}>
                        <Iconify icon="mdi:close" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {renderResourceStatus(resource)}

                      {resource.type === "deployment" &&
                        renderPingResult(resource as Deployment)}
                      {resource.zone && zones && (
                        <Chip
                          label={
                            zones.find(
                              (zone) =>
                                zone.name === resource.zone &&
                                zone.capabilities.includes(resource.type)
                            )?.description || resource.zone
                          }
                          icon={
                            <Iconify icon="mdi:earth" sx={{ opacity: 0.75 }} />
                          }
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
                    </>
                  )}
                </Stack>
                <div style={{ flexGrow: "1" }} />

                {resource.type === "deployment" && (
                  <>
                    {resource.specs.replicas > 1 && (
                      <ReplicaStatus deployment={resource as Deployment} />
                    )}
                    <DeploymentCommands deployment={resource as Deployment} />
                  </>
                )}

                {resource.type === "vm" && <VMCommands vm={resource as Vm} />}
              </Stack>

              <AlertList />
              {renderStaleResourceHeaderFullWidth(resource)}
              <JobList />

              {resource.type === "vm" && <SSHString vm={resource as Vm} />}

              {resource.type === "vm" && <GPUManager vm={resource as Vm} />}

              {resource.type === "vm" && <PortManager vm={resource as Vm} />}

              {resource.type === "vm" && <ProxyManager vm={resource as Vm} />}

              {resource.type === "deployment" && (
                <EnvManager deployment={resource as Deployment} />
              )}

              {resource.type === "deployment" && (
                <StorageManager
                  deployment={resource as Deployment}
                  persistent={persistent}
                  setPersistent={setPersistent}
                />
              )}

              {resource.type === "deployment" && (
                <PrivateMode deployment={resource as Deployment} />
              )}

              {resource.type === "deployment" && (
                <ImageManager deployment={resource as Deployment} />
              )}

              {resource.type === "deployment" &&
                user?.role?.permissions.includes("useCustomDomains") && (
                  <DomainManager deployment={resource as Deployment} />
                )}

              {resource.type === "deployment" &&
                (resource as Deployment).deploymentType !== "prebuilt" && (
                  <GHActions resource={resource as Deployment} />
                )}

              <Specs resource={resource} />

              {resource.type === "deployment" && (
                <LogsView deployment={resource as Deployment} />
              )}

              {resource.type === "deployment" && (
                <HealthCheckRoute deployment={resource as Deployment} />
              )}

              {user?.admin && <NeverStaleMode resource={resource} />}

              <DangerZone resource={resource} />
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
