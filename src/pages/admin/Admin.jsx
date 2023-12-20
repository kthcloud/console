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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { decode } from "js-base64";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteDeployment, getDeployments } from "src/api/deploy/deployments";
import { getAllUsers } from "src/api/deploy/users";
import { deleteVM, detachGPU, getGPUs, getVMs } from "src/api/deploy/vms";
import LoadingPage from "src/components/LoadingPage";
import Page from "src/components/Page";
import useInterval from "src/hooks/useInterval";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";
import { hashGPUId } from "src/utils/helpers";

export const Admin = () => {
  const { t } = useTranslation();

  // ==================================================
  // Keycloak/user session

  const { keycloak, initialized } = useKeycloak();
  const { user, setImpersonatingDeployment, setImpersonatingVm } =
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
    const startTimer = Date.now();
    try {
      const response = await getAllUsers(keycloak.token);
      setDbUsers(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-could-not-fetch-users") + ": " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getVMs(keycloak.token, true);
      setDbVMs(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-could-not-fetch-vms") + ": " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getDeployments(keycloak.token, true);
      setDbDeployments(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-could-not-fetch-deployments") + ": " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getGPUs(keycloak.token);
      setDbGPUs(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-could-not-fetch-gpus") + ": " + e, {
          variant: "error",
        })
      );
    }

    // end timer and set last refresh, show in ms
    setLastRefresh(new Date());
    setLastRefreshRtt(Date.now() - startTimer + " ms");
    setLoading(false);
  };

  useEffect(() => {
    if (!initialized) return;
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // ==================================================
  // Users
  const [dbUsers, setDbUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState("");
  const [loadedUsers, setLoadedUsers] = useState(false);
  const filterUsers = async () => {
    setLoadedUsers(true);

    const filtered = [];

    for (let i = 0; i < dbUsers.length; i++) {
      const user = dbUsers[i];
      if (
        user.id.includes(usersFilter) ||
        user.username.includes(usersFilter) ||
        user.email.includes(usersFilter) ||
        user.role.name.includes(usersFilter) ||
        usersFilter === ""
      ) {
        filtered.push(user);
      }
    }

    setUsers(filtered);
  };

  const renderUsername = (id) => {
    let user = dbUsers.find((user) => user.id === id);
    return (
      <Stack direction={"column"}>
        <Typography variant="caption">{id}</Typography>
        {user && <Typography variant="caption">{user.username}</Typography>}
      </Stack>
    );
  };

  // ==================================================
  // Virtual Machines
  const [dbVMs, setDbVMs] = useState([]);
  const [vmFilter, setVmFilter] = useState("");
  const [vms, setVms] = useState([]);
  const [loadedVms, setLoadedVms] = useState(false);

  const filterVms = async () => {
    setLoadedVms(true);

    const filtered = [];
    for (let i = 0; i < dbVMs.length; i++) {
      const vm = dbVMs[i];
      if (
        vm.name.includes(vmFilter) ||
        vm.id.includes(vmFilter) ||
        vm.ownerId.includes(vmFilter) ||
        vmFilter === ""
      ) {
        filtered.push(vm);
      }
    }

    setVms(filtered);
  };

  // ==================================================
  // Deployments
  const [dbDeployments, setDbDeployments] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [deploymentsFilter, setDeploymentsFilter] = useState("");
  const [loadedDeployments, setLoadedDeployments] = useState(false);

  const filterDeployments = async () => {
    setLoadedDeployments(true);

    const filtered = [];
    for (let i = 0; i < dbDeployments.length; i++) {
      const deployment = dbDeployments[i];
      if (
        deployment.name.includes(deploymentsFilter) ||
        deployment.id.includes(deploymentsFilter) ||
        deployment.ownerId.includes(deploymentsFilter) ||
        deploymentsFilter === ""
      ) {
        filtered.push(deployment);
      }
    }

    setDeployments(filtered);
  };

  // ==================================================
  // GPUs
  const [dbGPUs, setDbGPUs] = useState([]);
  const [gpus, setGPUs] = useState([]);
  const [gpusFilter, setGPUsFilter] = useState("");
  const [loadedGPUs, setLoadedGPUs] = useState(false);

  const filterGPUs = async () => {
    setLoadedGPUs(true);

    const filtered = [];
    for (let i = 0; i < dbGPUs.length; i++) {
      const gpu = dbGPUs[i];
      if (
        gpu.id.includes(gpusFilter) ||
        gpu.name.includes(gpusFilter) ||
        decode(gpu.id).includes(gpusFilter) ||
        gpusFilter === ""
      ) {
        filtered.push(gpu);
      }
    }

    setGPUs(filtered);
  };

  useInterval(() => {
    const now = new Date();
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

  const impersonate = (resourceType, id) => {
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
              borderRadius: 1,
              borderColor: "#ccd6e1",
            }}
          >
            <Toolbar>
              <Typography variant="h4">{t("admin-title")}</Typography>
              <Box sx={{ flexGrow: 1 }} />
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
                        {" " + lastRefreshRtt + " "}
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
                          <TableCell>{t("admin-integrations")}</TableCell>
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
                              {deployment.integrations &&
                                deployment.integrations.join(", ")}
                            </TableCell>
                            <TableCell>{deployment.status}</TableCell>
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
                                <Button
                                  color="error"
                                  onClick={() =>
                                    deleteDeployment(
                                      deployment.id,
                                      keycloak.token
                                    )
                                  }
                                >
                                  {t("button-delete")}
                                </Button>
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
                <CardHeader title={t("resource-vms")} />

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
                                  {Object.keys(vm.specs).map((key) => (
                                    <Typography
                                      variant="caption"
                                      key={vm.id + key}
                                    >
                                      {key + ": " + vm.specs[key]}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {vm.gpu && (
                                <Stack direction={"column"}>
                                  <Typography variant="caption">
                                    {`${decode(vm.gpu.id)} ${hashGPUId(
                                      vm.gpu.id
                                    )}`}
                                  </Typography>
                                  <Typography variant="caption">
                                    {vm.gpu.leaseEnd}
                                  </Typography>
                                  <Typography variant="caption">
                                    {vm.gpu.expired ? (
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
                                    onClick={() =>
                                      detachGPU(vm, keycloak.token)
                                    }
                                  >
                                    {t("button-detach-gpu")}
                                  </Button>
                                )}

                                <Button
                                  color="error"
                                  onClick={() =>
                                    deleteVM(vm.id, keycloak.token)
                                  }
                                >
                                  {t("button-delete")}
                                </Button>
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
                                {Object.keys(user.usage).map((key) => (
                                  <Typography
                                    variant="caption"
                                    key={user.id + key}
                                  >
                                    {key +
                                      ": " +
                                      user.usage[key] +
                                      "/" +
                                      user.quota[key]}
                                  </Typography>
                                ))}
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
                          <TableCell>{t("admin-leased-until")}</TableCell>
                          <TableCell>{t("admin-gpu-expired")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gpus.map((gpu) => (
                          <TableRow key={gpu.id}>
                            <TableCell>
                              {`${decode(gpu.id)} ${hashGPUId(gpu.id)}`}
                            </TableCell>
                            <TableCell>{gpu.name}</TableCell>
                            <TableCell>
                              {gpu.lease &&
                                gpu.lease.end
                                  .replace("Z", "")
                                  .replace("T", " ")
                                  .split(".")[0] + " UTC"}
                            </TableCell>
                            <TableCell>
                              {gpu.lease && gpu.lease.expired
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
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};
