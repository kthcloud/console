import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

const ProxyManager = ({ vm }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [newProxy, setNewProxy] = useState({ name: "", customDomain: "" });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { queueJob, user } = useResource();
  const [expanded, setExpanded] = useState(false);
  const [ports, setPorts] = useState([]);
  const [deleting, setDeleting] = useState([]);
  const [editing, setEditing] = useState({});

  const [selectedPort, setSelectedPort] = useState("");

  useEffect(() => {
    let tcpPorts = vm.ports.filter((port) => port.protocol === "tcp");

    let proxies = [];
    tcpPorts.forEach((port) => {
      if (port.httpProxy) {
        port.httpProxy.port = port.port;
        proxies.push(port.httpProxy);
      }
    });
    setProxies(proxies);
    setPorts(tcpPorts);
    if (selectedPort === "" && tcpPorts.length > 0)
      setSelectedPort(tcpPorts[0].port);

    setDeleting(
      deleting.filter((p) => tcpPorts.find((port) => port.name === p.name))
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      enqueueSnackbar(`${t("creating-proxy")} ${newProxy.name}...`, {
        variant: "info",
      });

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

    setDeleting([...deleting, proxy.name]);

    let portsList = vm.ports;

    portsList.forEach((port) => {
      if (port.httpProxy?.name === proxy.name) {
        port.httpProxy = null;
      }
    });

    try {
      const res = await updateVM(vm.id, { ports: portsList }, keycloak.token);
      queueJob(res);
      enqueueSnackbar(`${t("deleting-proxy")} ${proxy.name}...`, {
        variant: "info",
      });
    } catch (err) {
      errorHandler(err).forEach((e) =>
        enqueueSnackbar(e, { variant: "error" })
      );
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("proxies")}
        subheader={
          <span>
            {t("proxies-subheader-1")}
            <br />
            {t("proxies-subheader-2")}
          </span>
        }
      />
      <CardContent>
        {ports && (
          <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
          >
            <DialogTitle>
              {!editing ? t("new-proxy") : `${t("editing")} ${editing.name}`}
            </DialogTitle>
            <DialogContent>
              <Stack
                direction="column"
                alignItems={"flex-start"}
                useFlexGap
                spacing={5}
              >
                <Stack spacing={1}>
                  <Typography variant="body1">{t("select-port")}</Typography>
                  <Select
                    value={selectedPort}
                    onChange={(e) => setSelectedPort(e.target.value)}
                  >
                    {ports.map((port) => (
                      <MenuItem value={port.port} key={port.port}>
                        {port.name} ({port.protocol.toUpperCase()}:{port.port})
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>

                <Stack>
                  {!editing && (
                    <>
                      <Typography variant="body1">{t("admin-name")}</Typography>
                      <RFC1035Input
                        label={t("admin-name")}
                        variant="standard"
                        callToAction={t("admin-name-call-to-action")}
                        cleaned={newProxy.name}
                        setCleaned={(val) =>
                          setNewProxy({ ...newProxy, name: val })
                        }
                      />
                    </>
                  )}
                </Stack>

                {user?.role?.permissions?.includes("useCustomDomains") && (
                  <Accordion
                    expanded={expanded}
                    onChange={() => setExpanded(!expanded)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1bh-content"
                      id="panel1bh-header"
                    >
                      <Typography>
                        {t("create-deployment-custom-domain")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1">
                        {t("cname-record")}
                      </Typography>
                      <TextField
                        label={t("custom-domain-optional")}
                        variant="standard"
                        fullWidth
                        value={
                          newProxy.customDomain ? newProxy.customDomain : ""
                        }
                        onChange={(e) => {
                          setNewProxy({
                            ...newProxy,
                            customDomain: e.target.value,
                          });
                        }}
                      />
                    </AccordionDetails>
                  </Accordion>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => setCreateDialogOpen(false)}
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={loading}
              >
                {t("deploy-proxy")}
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
                    <TableCell>{t("admin-name")}</TableCell>
                    <TableCell>{t("internal-port")}</TableCell>
                    <TableCell>{t("url")}</TableCell>
                    <TableCell align="right">{t("admin-actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proxies.map((proxy, index) => (
                    <TableRow key={"proxy" + index}>
                      {!deleting.includes(proxy.name) ? (
                        <>
                          <TableCell>{proxy.name}</TableCell>
                          <TableCell>{proxy.port}</TableCell>
                          <TableCell>
                            <Link
                              href={
                                proxy.customDomain && proxy.customDomainUrl
                                  ? proxy.customDomainUrl
                                  : proxy.url
                              }
                            >
                              {proxy.customDomain && proxy.customDomainUrl
                                ? proxy.customDomainUrl
                                : proxy.url}
                            </Link>
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
                                  setEditing(proxy);
                                  setSelectedPort(proxy.port);
                                  setCreateDialogOpen(true);
                                  setExpanded(Boolean(proxy.customDomain));
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
                        </>
                      ) : (
                        <>
                          <TableCell>{proxy.name}</TableCell>
                          <TableCell>{t("deleting")}</TableCell>
                        </>
                      )}
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
              onClick={() => {
                setEditing(null);
                setNewProxy({ name: "", customDomain: "" });
                setExpanded(false);
                setCreateDialogOpen(true);
              }}
              disabled={vm?.ports?.length === 0}
            >
              {t("deploy-proxy")}
            </Button>
            {vm?.ports?.length === 0 && (
              <Typography variant="body2">{t("tcp-first")}</Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProxyManager;
