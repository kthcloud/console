import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Link,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { decode } from "js-base64";
import { enqueueSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteDeployment, getDeployments } from "../../api/deploy/deployments";
import { getJobs, restartJob } from "../../api/deploy/jobs";
import { getTeams } from "../../api/deploy/teams";
import { getAllUsers } from "../../api/deploy/users";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import useInterval from "../../hooks/useInterval";
import useResource from "../../hooks/useResource";
import { errorHandler } from "../../utils/errorHandler";
import { Deployment, Job, User, Uuid, Vm } from "../../types";
import { TeamRead } from "@kthcloud/go-deploy-types/types/v2/body";
import { deleteVM, listVMs } from "../../api/deploy/vms";
import { GpuLeaseRead } from "@kthcloud/go-deploy-types/types/v2/body";
import { deleteGpuLease, listGpuLeases } from "../../api/deploy/gpuLeases";
import { sentenceCase } from "change-case";
import { getReasonPhrase } from "http-status-codes";
import ConfirmButton from "../../components/ConfirmButton";
import { NoWrapTable as Table } from "../../components/NoWrapTable";

export const Admin = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // ==================================================
  // Keycloak/user session

  const { initialized, keycloak } = useKeycloak();
  const { user, setImpersonatingDeployment, setImpersonatingVm, gpuGroups } =
    useResource();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!user.admin) {
      enqueueSnackbar("Cannot access admin panel: Unauthorized", {
        variant: "error",
      });
      navigate("/deploy");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ==================================================
  // Get resources
  const [lastRefreshRtt, setLastRefreshRtt] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [timeDiffSinceLastRefresh, setTimeDiffSinceLastRefresh] = useState("");
  const [loading, setLoading] = useState(true);
  const getResources = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;

    const startTimer = Date.now();
    const promises = [
      async () => {
        try {
          const response = await getAllUsers(keycloak.token!);
          setDbUsers(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-users") + ": " + e, {
              variant: "error",
            })
          );
        }
      },

      async () => {
        try {
          const response = await listVMs(keycloak.token!, true);
          setDbVMs(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-vms") + ": " + e, {
              variant: "error",
            })
          );
        }
      },
      async () => {
        try {
          const response = await getDeployments(keycloak.token!, true);
          setDbDeployments(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-deployments") + ": " + e, {
              variant: "error",
            })
          );
        }
      },
      async () => {
        try {
          const response = await listGpuLeases(
            keycloak.token!,
            undefined,
            true
          );
          setDbGPUs(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-gpus") + ": " + e, {
              variant: "error",
            })
          );
        }
      },
      async () => {
        try {
          const response = await getTeams(keycloak.token!, true);
          setDbTeams(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-teams") + ": " + e, {
              variant: "error",
            })
          );
        }
      },

      async () => {
        try {
          const response = await getJobs(
            keycloak.token!,
            undefined,
            undefined,
            true
          );
          setDbJobs(response);
        } catch (error: any) {
          errorHandler(error).forEach((e) =>
            enqueueSnackbar(t("error-could-not-fetch-jobs") + ": " + e, {
              variant: "error",
            })
          );
        }
      },
    ];

    await Promise.all(promises.map((p) => p()));

    // end timer and set last refresh, show in ms
    setLastRefresh(new Date().getTime());
    setLastRefreshRtt(Date.now() - startTimer);
    setLoading(false);
  };

  useEffect(() => {
    if (!initialized) return;
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // ==================================================
  // Helpers
  const renderGpuName = (gpuLeaseId: Uuid) => {
    const group = gpuGroups.find((g) => g.id === gpuLeaseId);
    if (!group) return "";

    return `${group.vendor.replace("Corporation", "").trim()} ${group.displayName}`;
  };

  // ==================================================
  // Users
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersFilter, setUsersFilter] = useState<string>("");
  const [loadedUsers, setLoadedUsers] = useState<boolean>(false);
  const filterUsers = async () => {
    setLoadedUsers(true);

    const filtered = [];

    for (let i = 0; i < dbUsers.length; i++) {
      const user = dbUsers[i];
      if (
        user.id?.toLowerCase().includes(usersFilter.toLowerCase()) ||
        user.username?.toLowerCase().includes(usersFilter.toLowerCase()) ||
        user.email?.toLowerCase().includes(usersFilter.toLowerCase()) ||
        "admin".toLowerCase().includes(usersFilter.toLowerCase()) ||
        "onboarded".toLowerCase().includes(usersFilter.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(usersFilter.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(usersFilter.toLowerCase()) ||
        usersFilter === ""
      ) {
        filtered.push(user);
      }
    }

    setUsers(filtered);
  };

  const renderUsername = (id: Uuid) => {
    const user = dbUsers.find((user) => user.id === id);
    return (
      <Stack direction={"column"}>
        <Typography variant="caption">{id}</Typography>
        {user && <Typography variant="caption">{user.username}</Typography>}
      </Stack>
    );
  };

  const renderGpuLeaser = (gpu: GpuLeaseRead) => {
    const vm = dbVMs.find((vm) => gpu.vmId === vm.id);

    return (
      <>
        <TableCell>{renderUsername(gpu.userId)}</TableCell>
        {vm ? (
          <TableCell>
            <Stack direction={"column"}>
              <Typography variant="caption">{vm.id}</Typography>
              {user && <Typography variant="caption">{vm.name}</Typography>}
            </Stack>
          </TableCell>
        ) : (
          <TableCell></TableCell>
        )}
      </>
    );
  };

  // ==================================================
  // Virtual Machines
  const [dbVMs, setDbVMs] = useState<Vm[]>([]);
  const [vmFilter, setVmFilter] = useState<string>("");
  const [vms, setVms] = useState<Vm[]>([]);
  const [loadedVms, setLoadedVms] = useState<boolean>(false);

  const filterVms = async () => {
    setLoadedVms(true);

    const filtered = new Array<Vm>();
    for (let i = 0; i < dbVMs.length; i++) {
      const vm = dbVMs[i];
      if (
        vm.name?.toLowerCase().includes(vmFilter.toLowerCase()) ||
        vm.id?.toLowerCase().includes(vmFilter.toLowerCase()) ||
        vm.ownerId?.toLowerCase().includes(vmFilter.toLowerCase()) ||
        vm.zone?.toLowerCase().includes(vmFilter.toLowerCase()) ||
        vm.host?.toLowerCase().includes(vmFilter.toLowerCase()) ||
        vmFilter === ""
      ) {
        filtered.push(vm);
      }
    }

    setVms(filtered);
  };

  // ==================================================
  // Deployments
  const [dbDeployments, setDbDeployments] = useState<Deployment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [deploymentsFilter, setDeploymentsFilter] = useState<string>("");
  const [loadedDeployments, setLoadedDeployments] = useState<boolean>(false);

  const filterDeployments = async () => {
    setLoadedDeployments(true);

    const filtered = [];
    for (let i = 0; i < dbDeployments.length; i++) {
      const deployment = dbDeployments[i];
      if (
        deployment.name
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.id
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.ownerId
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.zone
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.status
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.pingResult
          ?.toString()
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deployment.healthCheckPath
          ?.toLowerCase()
          .includes(deploymentsFilter.toLowerCase()) ||
        deploymentsFilter === ""
      ) {
        filtered.push(deployment);
      }
    }

    setDeployments(filtered);
  };

  const renderCustomDomain = (deployment: Deployment) => {
    if (!deployment.customDomain) return "";

    if (deployment.customDomain.status === "active") {
      return (
        <Stack direction={"column"}>
          <Link
            href={deployment.customDomain ? deployment.customDomain.url : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {deployment.customDomain.domain}
          </Link>
          <Typography variant="caption" sx={{ color: "#37be5f" }}>
            {sentenceCase(deployment.customDomain.status)}
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack direction={"column"}>
        <Typography variant="body2">
          {deployment.customDomain.domain}
        </Typography>
        <Typography variant="caption" sx={{ color: "orange" }}>
          {sentenceCase(deployment.customDomain.status)}
        </Typography>
      </Stack>
    );
  };

  // ==================================================
  // GPUs
  const [dbGPUs, setDbGPUs] = useState<GpuLeaseRead[]>([]);
  const [gpus, setGPUs] = useState<GpuLeaseRead[]>([]);
  const [gpusFilter, setGPUsFilter] = useState<string>("");
  const [loadedGPUs, setLoadedGPUs] = useState<boolean>(false);

  const filterGPUs = async () => {
    setLoadedGPUs(true);

    const filtered = [];
    for (let i = 0; i < dbGPUs.length; i++) {
      const gpu = dbGPUs[i];
      if (
        gpu.id?.toLowerCase().includes(gpusFilter.toLowerCase()) ||
        decode(gpu.id)?.toLowerCase().includes(gpusFilter.toLowerCase()) ||
        gpusFilter === ""
      ) {
        filtered.push(gpu);
      }
    }

    setGPUs(filtered);
  };

  // ==================================================
  // Teams

  const [dbTeams, setDbTeams] = useState<TeamRead[]>([]);
  const [teams, setTeams] = useState<TeamRead[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [loadedTeams, setLoadedTeams] = useState<boolean>(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const filterTeams = async () => {
    setLoadedTeams(true);

    const filtered = [];

    for (let i = 0; i < dbTeams.length; i++) {
      const team = dbTeams[i];
      if (
        team.id?.toLowerCase().includes(teamFilter.toLowerCase()) ||
        team.name?.toLowerCase().includes(teamFilter.toLowerCase()) ||
        team.description?.toLowerCase().includes(teamFilter.toLowerCase()) ||
        teamFilter === ""
      ) {
        filtered.push(team);
      }
    }

    setTeams(filtered);
  };

  // ==================================================
  // Jobs

  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobFilter, setJobFilter] = useState<string>("");
  const [loadedJobs, setLoadedJobs] = useState<boolean>(false);
  const [restartingJobs, setRestartingJobs] = useState<string[]>([]);

  const filterJobs = async () => {
    setLoadedJobs(true);

    const filtered = [];

    for (let i = 0; i < dbJobs.length; i++) {
      const job = dbJobs[i];

      if (
        job.createdAt?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.finishedAt?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.id?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.lastRunAt?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.runAfter?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.status?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.type?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        job.userId?.toLowerCase().includes(jobFilter.toLowerCase()) ||
        jobFilter === ""
      ) {
        filtered.push(job);
      }
    }
    setJobs(filtered);
  };

  // ==================================================
  // Time since last refresh

  useInterval(() => {
    const now = new Date().getTime();
    const diff = now - lastRefresh;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      setTimeDiffSinceLastRefresh(hours + " " + t("time-hours-ago"));
      return;
    }
    if (minutes > 0) {
      setTimeDiffSinceLastRefresh(minutes + " " + t("time-minutes-ago"));
      return;
    }

    if (seconds > 0) {
      setTimeDiffSinceLastRefresh(seconds + " " + t("time-seconds-ago"));
      return;
    }

    setTimeDiffSinceLastRefresh("0 " + t("time-seconds-ago"));
  }, 1000);

  const impersonate = (resourceType: string, id: Uuid) => {
    if (resourceType === "vm") {
      setImpersonatingVm(id);
      navigate("/edit/vm/" + id);
    } else if (resourceType === "deployment") {
      setImpersonatingDeployment(id);
      navigate("/edit/deployment/" + id);
    }
  };

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title={t("admin-title")}>
          <AppBar
            position="fixed"
            color="inherit"
            sx={{
              top: "auto",
              bottom: 0,
              borderTop: 1,
              borderColor: theme.palette.grey[300],
            }}
          >
            <Toolbar>
              <Typography variant="h4">{t("admin-title")}</Typography>
              <Box component="div" sx={{ flexGrow: 1 }} />
              <Stack direction="row" alignItems={"center"} spacing={3}>
                <Button variant="contained" onClick={getResources}>
                  {t("admin-refresh-resources")}
                </Button>
                <Typography variant="body1">
                  {loading ? (
                    t("loading")
                  ) : (
                    <span>
                      RTT:
                      <span style={{ fontFamily: "monospace" }}>
                        {" " + lastRefreshRtt + " ms "}
                      </span>
                      {t("admin-last-load")}:
                      <span style={{ fontFamily: "monospace" }}>
                        {" " + timeDiffSinceLastRefresh}
                      </span>
                    </span>
                  )}
                </Typography>
              </Stack>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl">
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("menu-admin-panel")}
              </Typography>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("resource-deployments")} />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={deploymentsFilter}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterDeployments();
                      }}
                      onChange={(e) => {
                        setDeploymentsFilter(e.target.value.trim());
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterDeployments}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setDeployments([]);
                        setLoadedDeployments(false);
                        setDeploymentsFilter("");
                      }}
                      disabled={!loadedDeployments}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        deployments.length +
                        "/" +
                        dbDeployments.length +
                        " " +
                        t("admin-loaded-deployments")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("admin-user")}</TableCell>
                          <TableCell>{t("admin-visibility")}</TableCell>
                          <TableCell>{t("create-deployment-domain")}</TableCell>
                          <TableCell>{t("admin-status")}</TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deployments.map((deployment) => (
                          <TableRow key={deployment.id}>
                            <TableCell>
                              <Stack direction={"column"}>
                                <Typography variant="caption">
                                  {deployment.id}
                                </Typography>
                                <Typography variant="caption">
                                  {deployment.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {renderUsername(deployment.ownerId)}
                            </TableCell>
                            <TableCell>
                              {deployment.private
                                ? t("admin-visibility-private")
                                : t("admin-visibility-public")}
                            </TableCell>
                            <TableCell>
                              {renderCustomDomain(deployment)}
                            </TableCell>
                            <TableCell>
                              <Stack direction={"column"}>
                                <Typography variant="caption">
                                  {sentenceCase(
                                    deployment.status.replace("resource", "")
                                  )}
                                </Typography>
                                {deployment.pingResult && (
                                  <Tooltip
                                    title={
                                      "HTTP " +
                                      deployment.pingResult +
                                      " " +
                                      getReasonPhrase(deployment.pingResult)
                                    }
                                    placement="bottom-start"
                                  >
                                    <Typography variant="caption">
                                      {deployment.pingResult}
                                    </Typography>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row">
                                <Button
                                  size="small"
                                  onClick={() =>
                                    impersonate("deployment", deployment.id)
                                  }
                                >
                                  {t("button-edit")}
                                </Button>
                                <ConfirmButton
                                  action={t("button-delete")}
                                  actionText={
                                    t("button-delete") + " deployment"
                                  }
                                  callback={() => {
                                    if (keycloak.token)
                                      deleteDeployment(
                                        deployment.id,
                                        keycloak.token
                                      );
                                  }}
                                  props={{
                                    color: "error",
                                  }}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("vms")} />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={vmFilter}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterVms();
                      }}
                      onChange={(e) => {
                        setVmFilter(e.target.value.trim());
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterVms}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setVms([]);
                        setLoadedVms(false);
                        setVmFilter("");
                      }}
                      disabled={!loadedVms}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        vms.length +
                        "/" +
                        dbVMs.length +
                        " " +
                        t("admin-loaded-vms")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("admin-user")}</TableCell>
                          <TableCell>{t("admin-specs")}</TableCell>
                          <TableCell>{t("admin-gpu")}</TableCell>
                          <TableCell>{t("admin-status")}</TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vms.map((vm) => (
                          <TableRow key={vm.id}>
                            <TableCell>
                              <Stack direction={"column"}>
                                <Typography variant="caption">
                                  {vm.id}
                                </Typography>
                                <Typography variant="caption">
                                  {vm.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{renderUsername(vm.ownerId)}</TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                <Stack direction={"column"}>
                                  {vm.specs?.cpuCores && (
                                    <Typography
                                      variant="caption"
                                      key={vm.id + "cpuCores"}
                                    >
                                      {"cpu: " + vm.specs?.cpuCores}
                                    </Typography>
                                  )}
                                  {vm.specs?.cpuCores && (
                                    <Typography
                                      variant="caption"
                                      key={vm.id + "ram"}
                                    >
                                      {"ram: " + vm.specs?.ram}
                                    </Typography>
                                  )}
                                  {vm.specs?.cpuCores && (
                                    <Typography
                                      variant="caption"
                                      key={vm.id + "diskSize"}
                                    >
                                      {"disk: " + vm.specs?.diskSize}
                                    </Typography>
                                  )}
                                </Stack>
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {vm.gpu && (
                                <Stack direction={"column"}>
                                  <Typography variant="caption">
                                    {renderGpuName(vm.gpu.gpuGroupId)}
                                  </Typography>
                                  {vm.gpu?.expiresAt && (
                                    <Typography variant="caption">
                                      {vm.gpu.expiresAt}
                                    </Typography>
                                  )}
                                  <Typography variant="caption">
                                    {vm.gpu?.expiredAt ? (
                                      <b>{t("admin-gpu-expired")}</b>
                                    ) : (
                                      t("admin-gpu-active")
                                    )}
                                  </Typography>
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell>{vm.status}</TableCell>
                            <TableCell>
                              <Stack direction="row">
                                <Button
                                  size="small"
                                  onClick={() => impersonate("vm", vm.id)}
                                >
                                  {t("button-edit")}
                                </Button>
                                {vm.gpu && (
                                  <Button
                                    color="error"
                                    onClick={() => {
                                      if (keycloak.token)
                                        deleteGpuLease(
                                          keycloak.token,
                                          vm.gpu!.id
                                        );
                                    }}
                                  >
                                    {t("button-detach-gpu")}
                                  </Button>
                                )}

                                <ConfirmButton
                                  action={t("button-delete")}
                                  actionText={t("button-delete") + " vm"}
                                  callback={() => {
                                    if (keycloak.token)
                                      deleteVM(keycloak.token, vm.id);
                                  }}
                                  props={{
                                    color: "error",
                                  }}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title="Users"
                  subheader={
                    <Typography variant="body2">
                      {t("admin-edit-permissions-in") + " "}
                      <Link
                        href="https://iam.cloud.cbh.kth.se"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Keycloak
                      </Link>
                    </Typography>
                  }
                />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={usersFilter}
                      onChange={(e) => {
                        setUsersFilter(e.target.value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterUsers();
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterUsers}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setUsers([]);
                        setLoadedUsers(false);
                        setUsersFilter("");
                      }}
                      disabled={!loadedUsers}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        users.length +
                        "/" +
                        dbUsers.length +
                        " " +
                        t("admin-loaded-users")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-id")}</TableCell>
                          <TableCell>{t("admin-username")}</TableCell>
                          <TableCell>{t("admin-email")}</TableCell>
                          <TableCell>{t("admin-role")}</TableCell>
                          <TableCell>{t("admin-is-admin")}</TableCell>
                          <TableCell>{t("admin-usage")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role.name}</TableCell>
                            <TableCell>
                              {user.admin && t("admin-is-admin")}
                            </TableCell>
                            <TableCell>
                              <Stack direction={"column"}>
                                <Typography
                                  variant="caption"
                                  key={user.id + "cpuCores"}
                                >
                                  {"cpuCores: " +
                                    user.usage.cpuCores +
                                    "/" +
                                    user.quota.cpuCores}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  key={user.id + "ram"}
                                >
                                  {"ram: " +
                                    user.usage.ram +
                                    "/" +
                                    user.quota.ram}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  key={user.id + "diskSize"}
                                >
                                  {"diskSize: " +
                                    user.usage.diskSize +
                                    "/" +
                                    user.quota.diskSize}
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("resource-gpu")} />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={gpusFilter}
                      onChange={(e) => {
                        setGPUsFilter(e.target.value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterGPUs();
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterGPUs}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setGPUs([]);
                        setLoadedGPUs(false);
                        setGPUsFilter("");
                      }}
                      disabled={!loadedGPUs}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        gpus.length +
                        "/" +
                        dbGPUs.length +
                        " " +
                        t("admin-loaded-gpus")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-id")}</TableCell>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("admin-user")}</TableCell>
                          <TableCell>{`${t("vm")} ${t("admin-name").toLowerCase()}`}</TableCell>
                          <TableCell>{t("admin-leased-until")}</TableCell>
                          <TableCell>{t("admin-gpu-expired")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gpus.map((gpu) => (
                          <TableRow key={gpu.id}>
                            <TableCell>{gpu.id}</TableCell>
                            <TableCell>
                              {renderGpuName(gpu.gpuGroupId)}
                            </TableCell>
                            {renderGpuLeaser(gpu)}
                            <TableCell>
                              {gpu.expiresAt
                                ? gpu.expiresAt
                                    .replace("Z", "")
                                    .replace("T", " ")
                                    .split(".")[0] + " UTC"
                                : ""}
                            </TableCell>
                            <TableCell>
                              {gpu && gpu.expiredAt
                                ? t("admin-gpu-expired")
                                : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("teams")} />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={teamFilter}
                      onChange={(e) => {
                        setTeamFilter(e.target.value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterTeams();
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterTeams}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setTeams([]);
                        setLoadedTeams(false);
                        setTeamFilter("");
                      }}
                      disabled={!loadedTeams}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        teams.length +
                        "/" +
                        dbTeams.length +
                        " " +
                        t("admin-loaded-teams")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-id")}</TableCell>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("members")}</TableCell>
                          <TableCell>{t("resources")}</TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.map((team) => (
                          <Fragment key={team.id}>
                            <TableRow>
                              <TableCell>
                                <Typography variant="caption">
                                  {team.id}
                                </Typography>
                              </TableCell>
                              <TableCell>{team.name}</TableCell>
                              <TableCell>{team.members.length}</TableCell>
                              <TableCell>{team.resources.length}</TableCell>
                              <TableCell>
                                <Stack direction="row">
                                  <Button
                                    size="small"
                                    color={
                                      expandedTeam === team.id
                                        ? "error"
                                        : "primary"
                                    }
                                    onClick={() =>
                                      setExpandedTeam(
                                        expandedTeam === team.id
                                          ? null
                                          : team.id
                                      )
                                    }
                                  >
                                    {expandedTeam === team.id
                                      ? t("button-close")
                                      : t("details")}
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {expandedTeam === team.id && (
                              <>
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <TableContainer>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>
                                              {t("admin-id")}
                                            </TableCell>
                                            <TableCell>
                                              {t("admin-username")}
                                            </TableCell>
                                            <TableCell>
                                              {t("admin-email")}
                                            </TableCell>
                                            <TableCell>
                                              {t("admin-status")}
                                            </TableCell>
                                            <TableCell>
                                              {t("joinedAt")}
                                            </TableCell>
                                            <TableCell>
                                              {t("addedAt")}
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {team.members.map((member) => (
                                            <TableRow
                                              key={"teammember" + member.id}
                                            >
                                              <TableCell>
                                                <Typography variant="caption">
                                                  {member.id}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                {member.username}
                                              </TableCell>
                                              <TableCell>
                                                {member.email}
                                              </TableCell>
                                              <TableCell>
                                                {member.memberStatus}
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="caption">
                                                  {member.joinedAt}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="caption">
                                                  {member.addedAt}
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <TableContainer>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>
                                              {t("admin-id")}
                                            </TableCell>
                                            <TableCell>
                                              {t("admin-name")}
                                            </TableCell>
                                            <TableCell>
                                              {t("admin-type")}
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {team.resources.map((resource) => (
                                            <TableRow
                                              key={"teamresource" + resource.id}
                                            >
                                              <TableCell>
                                                <Typography variant="caption">
                                                  {resource.id}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                {resource.name}
                                              </TableCell>
                                              <TableCell>
                                                {resource.type}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </TableCell>
                                </TableRow>
                              </>
                            )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("jobs")} />

                <CardContent>
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    mb={2}
                    spacing={2}
                    flexWrap={"wrap"}
                    useFlexGap
                  >
                    <TextField
                      label={t("button-filter")}
                      variant="outlined"
                      value={jobFilter}
                      onChange={(e) => {
                        setJobFilter(e.target.value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") filterJobs();
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={filterJobs}
                    >
                      {t("button-search")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setJobs([]);
                        setLoadedJobs(false);
                        setJobFilter("");
                      }}
                      disabled={!loadedJobs}
                    >
                      {t("button-clear")}
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-showing") +
                        " " +
                        jobs.length +
                        "/" +
                        dbJobs.length +
                        " " +
                        t("admin-loaded-jobs")}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-id")}</TableCell>
                          <TableCell>{t("type")}</TableCell>
                          <TableCell>{t("admin-status")}</TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <Typography variant="caption">
                                {job.id}
                              </Typography>
                            </TableCell>
                            <TableCell>{job.type}</TableCell>
                            <TableCell>{job.status}</TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {job.lastError}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems={"center"}
                                spacing={2}
                                useFlexGap
                              >
                                <LoadingButton
                                  size="small"
                                  onClick={async () => {
                                    if (!keycloak.token) return;
                                    setRestartingJobs([
                                      ...restartingJobs,
                                      job.id,
                                    ]);
                                    await restartJob(keycloak.token, job.id);
                                    setRestartingJobs(
                                      restartingJobs.filter((x) => x !== job.id)
                                    );
                                    enqueueSnackbar(t("jobRestarted"), {
                                      variant: "success",
                                    });
                                  }}
                                  loading={restartingJobs.includes(job.id)}
                                >
                                  {t("button-restart")}
                                </LoadingButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};
