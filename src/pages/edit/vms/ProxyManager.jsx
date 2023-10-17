import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateVM } from "src/api/deploy/vms";
import Iconify from "src/components/Iconify";
import RFC1035Input from "src/components/RFC1035Input";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

const ProxyManager = ({ vm }) => {
  const { initialized, keycloak } = useKeycloak();
  const [newProxy, setNewProxy] = useState({ name: "", customDomain: "" });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { queueJob } = useResource();
  const [selectedPort, setSelectedPort] = useState(
    vm?.ports?.length > 0 ? vm?.ports[0]?.port : ""
  );

  useEffect(() => {
    let proxies = [];
    vm.ports.forEach((port) => {
      if (port.httpProxy) {
        proxies.push(port.httpProxy);
      }
    });
    setProxies(proxies);
  }, [vm]);

  const handleCreate = async () => {
    if (!initialized) return;
    setLoading(true);

    let portsList = vm.ports;

    portsList.forEach((port) => {
      if (port.port === selectedPort) {
        port.httpProxy = { name: newProxy.name };
        if (newProxy.customDomain) {
          port.httpProxy.customDomain = newProxy.customDomain;
        }
      }
    });

    try {
      const res = await updateVM(vm.id, { ports: portsList }, keycloak.token);
      queueJob(res);

      enqueueSnackbar(`Creating proxy ${newProxy.name}...`, { variant: "info" });

      setCreateDialogOpen(false);
      setNewProxy({ name: "", customDomain: "" });
    } catch (err) {
      errorHandler(err).forEach((e) =>
        enqueueSnackbar(e, { variant: "error" })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proxy) => {
    if (!initialized) return;

    let portsList = vm.ports;

    portsList.forEach((port) => {
      if (port.httpProxy?.name === proxy.name) {
        port.httpProxy = null;
      }
    });

    try {
      const res = await updateVM(vm.id, { ports: portsList }, keycloak.token);
      queueJob(res);
      enqueueSnackbar(`Deleting proxy ${proxy.name}...`, { variant: "info" });
    } catch (err) {
      errorHandler(err).forEach((e) =>
        enqueueSnackbar(e, { variant: "error" })
      );
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title="Proxies"
        subheader={
          <span>
            Deploy a proxy to a port forwarded from your VM. <br />
            This makes them accessible with a nice URL at port 80 instead of the
            assigned external port.
          </span>
        }
      />
      <CardContent>
        {vm.ports && (
          <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
          >
            <DialogTitle>New proxy</DialogTitle>
            <DialogContent>
              <Stack
                direction="column"
                spacing={3}
                alignItems={"flex-start"}
                useFlexGap
              >
                <Typography variant="body1">Select port to proxy to</Typography>
                <Select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                >
                  {vm.ports.map((port) => (
                    <MenuItem value={port.port} key={port.port}>
                      {port.name} ({port.protocol.toUpperCase()}:{port.port})
                    </MenuItem>
                  ))}
                </Select>

                <br />

                <Typography variant="body1">
                  Name (will be used in URL unless custom domain is set)
                </Typography>
                <RFC1035Input
                  label="Name"
                  variant="standard"
                  callToAction="Proxy will have name: "
                  cleaned={newProxy.name}
                  setCleaned={(val) => setNewProxy({ ...newProxy, name: val })}
                />

                <br />

                <Typography variant="body1">
                  Custom domain (must be pointed to app.cloud.cbh.kth.se with
                  CNAME)
                </Typography>
                <TextField
                  label="Custom domain (optional)"
                  variant="standard"
                  fullWidth
                  value={newProxy.customDomain}
                  onChange={(e) =>
                    setNewProxy({ ...newProxy, customDomain: e.target.value })
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => setCreateDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={loading}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <Stack
          direction="column"
          spacing={3}
          alignItems={"flex-start"}
          useFlexGap
        >
          {proxies && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proxies.map((proxy, index) => (
                    <TableRow key={"proxy" + index}>
                      <TableCell>{proxy.name}</TableCell>
                      <TableCell>{proxy.port}</TableCell>
                      <TableCell>
                        {proxy.customDomain && proxy.customDomainUrl
                          ? proxy.customDomainUrl
                          : proxy.url}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          alignItems={"center"}
                          justifyContent={"flex-end"}
                        >
                          <IconButton
                            color="primary"
                            aria-label="edit proxy"
                            component="label"
                            disabled={loading}
                            onClick={() => {
                              setNewProxy(proxy);
                              setSelectedPort(proxy.port);
                              setCreateDialogOpen(true);
                            }}
                          >
                            <Iconify icon="mdi:pencil" />
                          </IconButton>
                          <IconButton
                            color="error"
                            aria-label="delete proxy"
                            component="label"
                            disabled={loading}
                            onClick={() => handleDelete(proxy)}
                          >
                            <Iconify icon="mdi:delete" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Stack direction="row" spacing={1} alignItems={"center"} useFlexGap>
            <Button
              variant="contained"
              pl={3}
              onClick={() => setCreateDialogOpen(true)}
              disabled={vm?.ports?.length === 0}
            >
              Create proxy
            </Button>
            {vm?.ports?.length === 0 && (
              <Typography variant="body2">
                Create a port forwarding rule first
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProxyManager;
