import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
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
        enqueueSnackbar("Could fetch users: " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getVMs(keycloak.token, true);
      setDbVMs(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could fetch vms: " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getDeployments(keycloak.token, true);
      setDbDeployments(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could fetch deployments: " + e, {
          variant: "error",
        })
      );
    }

    try {
      const response = await getGPUs(keycloak.token);
      setDbGPUs(response);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could fetch GPUs: " + e, {
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
      setTimeDiffSinceLastRefresh(hours + " hours ago");
      return;
    }
    if (minutes > 0) {
      setTimeDiffSinceLastRefresh(minutes + " minutes ago");
      return;
    }

    if (seconds > 0) {
      setTimeDiffSinceLastRefresh(seconds + " seconds ago");
      return;
    }

    setTimeDiffSinceLastRefresh("0 seconds ago");
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
        <Page title="Admin">
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
              <Typography variant="h4">Admin</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Stack direction="row" alignItems={"center"} spacing={3}>
                <Button variant="contained" onClick={getResources}>
                  Refresh resources
                </Button>
                <Typography variant="body1">
                  {loading ? (
                    "Loading..."
                  ) : (
                    <span>
                      RTT:
                      <span style={{ fontFamily: "monospace" }}>
                        {" " + lastRefreshRtt + " "}
                      </span>
                      Last load:
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
                <CardHeader title="Deployments" />

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
                      label="Filter"
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
                      Search
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
                      Clear
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {"Showing " +
                        deployments.length +
                        "/" +
                        dbDeployments.length +
                        " loaded deployments"}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Visibility</TableCell>
                          <TableCell>Integrations</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
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
                              {deployment.private ? "Private" : "Public"}
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
                                  Edit
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
                                  Delete
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
                <CardHeader title="Virtual Machines" />

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
                      label="Filter"
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
                      Search
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
                      Clear
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {"Showing " +
                        vms.length +
                        "/" +
                        dbVMs.length +
                        " loaded vms"}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Specs</TableCell>
                          <TableCell>GPU</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
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
                                    {vm.gpu.expired ? <b>Expired</b> : "Active"}
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
                                  Edit
                                </Button>
                                {vm.gpu && (
                                  <Button
                                    color="error"
                                    onClick={() =>
                                      detachGPU(vm, keycloak.token)
                                    }
                                  >
                                    Detach GPU
                                  </Button>
                                )}

                                <Button
                                  color="error"
                                  onClick={() =>
                                    deleteVM(vm.id, keycloak.token)
                                  }
                                >
                                  Delete
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
                      Edit user roles and permissions in{" "}
                      <a
                        href="https://iam.cloud.cbh.kth.se"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Keycloak
                      </a>
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
                      label="Filter"
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
                      Search
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
                      Clear
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {"Showing " +
                        users.length +
                        "/" +
                        dbUsers.length +
                        " loaded users"}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell>Usage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role.name}</TableCell>
                            <TableCell>{user.admin && "Admin"}</TableCell>
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
                <CardHeader title="GPU" />

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
                      label="Filter"
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
                      Search
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
                      Clear
                    </Button>
                    <Typography variant="body1" gutterBottom>
                      {"Showing " +
                        gpus.length +
                        "/" +
                        dbGPUs.length +
                        " loaded GPUs"}
                    </Typography>
                  </Stack>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Leased until</TableCell>
                          <TableCell>Expired</TableCell>
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
                              {gpu.lease && gpu.lease.expired ? "Expired" : ""}
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
