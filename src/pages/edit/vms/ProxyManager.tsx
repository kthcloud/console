import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateVM } from "../../../api/deploy/vms";
import Iconify from "../../../components/Iconify";
import RFC1035Input from "../../../components/RFC1035Input";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { sentenceCase } from "change-case";
import { Vm } from "../../../types";
import { HttpProxyRead, PortRead } from "kthcloud-types/types/v1/body";

interface Proxy extends HttpProxyRead {
  port?: number;
}

interface Port extends PortRead {
  httpProxy?: Proxy;
}

const ProxyManager = ({ vm }: { vm: Vm }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [newProxy, setNewProxy] = useState({ name: "", customDomain: "" });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { queueJob, user } = useResource();
  const [expanded, setExpanded] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [editing, setEditing] = useState<Proxy | null>(null);

  const [selectedPort, setSelectedPort] = useState<number>(0);

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const tcpPorts: Port[] = vm.ports.filter((port) => port.protocol === "tcp");

    const proxies: Proxy[] = [];
    tcpPorts.forEach((port) => {
      if (port.httpProxy) {
        port.httpProxy.port = port.port;
        proxies.push(port.httpProxy);
      }
    });
    setProxies(proxies);
    setPorts(tcpPorts);
    if (selectedPort === 0 && tcpPorts.length > 0 && tcpPorts[0].port)
      setSelectedPort(tcpPorts[0].port);

    setDeleting(
      deleting.filter((p) => tcpPorts.find((port) => port.name === p))
    );

    if (editing) {
      const editingProxy = proxies.find((proxy) => proxy.name === editing.name);
      if (editingProxy) setEditing(editingProxy);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm]);

  const handleCreate = async (clearCustomDomain = false) => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);

    const portsList = vm.ports;

    portsList.forEach((port) => {
      if (port.port === selectedPort) {
        port.httpProxy = { name: newProxy.name };
        if (newProxy.customDomain) {
          port.httpProxy.customDomain = newProxy.customDomain;
        }
        if (clearCustomDomain) {
          port.httpProxy.customDomain = "";
        }
      }
    });

    try {
      const res = await updateVM(vm.id, { ports: portsList }, keycloak.token);
      queueJob(res);

      enqueueSnackbar(`${t("creating-proxy")} ${newProxy.name}...`, {
        variant: "info",
      });

      if (!(editing && newProxy.customDomain)) {
        setCreateDialogOpen(false);
        setEditing(null);
        setNewProxy({ name: "", customDomain: "" });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(e, { variant: "error" })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proxy: Proxy) => {
    if (!(initialized && keycloak.token)) return;

    setDeleting([...deleting, proxy.name]);

    const portsList = vm.ports;

    portsList.forEach((port) => {
      if (port.httpProxy?.name === proxy.name) {
        port.httpProxy = undefined;
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
    <>
      {ports && (
        <Drawer
          anchor={md ? "bottom" : "right"}
          onClose={() => setCreateDialogOpen(false)}
          open={createDialogOpen}
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              sx: {
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(3px)",
              },
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h3" sx={{ p: 2 }}>
                {!editing ? t("new-proxy") : `${t("editing")} ${editing.name}`}
              </Typography>
              <IconButton onClick={() => setCreateDialogOpen(false)}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Stack>
            <Stack
              direction="column"
              alignItems={"flex-start"}
              useFlexGap
              spacing={5}
              sx={{ p: 2 }}
            >
              <Stack spacing={2} sx={{ minWidth: "100%" }}>
                <Typography variant="body1" gutterBottom>
                  {t("select-port")}
                </Typography>
                <FormControl>
                  <InputLabel id="ports-select-label">{t("port")}</InputLabel>
                  <Select
                    labelId="ports-select-label"
                    label={t("port")}
                    value={selectedPort}
                    onChange={(e) => setSelectedPort(e.target.value)}
                  >
                    {ports.map((port) => (
                      <MenuItem value={port.port} key={port.port}>
                        {port.name} ({port.protocol.toUpperCase()}:{port.port})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack>
                {!editing && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      {t("admin-name")}
                    </Typography>
                    <RFC1035Input
                      label={t("admin-name")}
                      variant="outlined"
                      callToAction={t("admin-name-call-to-action")}
                      cleaned={newProxy.name}
                      setCleaned={(val) =>
                        setNewProxy({ ...newProxy, name: val })
                      }
                      maxWidth={500}
                    />
                  </>
                )}
              </Stack>

              {user?.role?.permissions?.includes("useCustomDomains") &&
              !editing ? (
                <Typography variant="body2">
                  {t("edit-your-proxy-after-creation-for-custom-domain")}
                </Typography>
              ) : (
                <Accordion
                  expanded={expanded}
                  onChange={() => setExpanded(!expanded)}
                  disableGutters
                  sx={{ width: "100%" }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {t("create-deployment-custom-domain")}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" gutterBottom>
                      {t("setup-custom-domain-0")}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      {editing?.customDomain && t("setup-custom-domain-1")}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                      {t("setup-custom-domain-1-table")}
                    </Typography>

                    <Stack direction="column" spacing={3}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>{t("type")}</TableCell>
                              <TableCell>{t("admin-name")}</TableCell>
                              <TableCell>{t("content")}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>CNAME</TableCell>
                              <TableCell>
                                <TextField
                                  label={t("create-deployment-domain")}
                                  variant="outlined"
                                  value={
                                    newProxy.customDomain
                                      ? newProxy.customDomain
                                      : ""
                                  }
                                  onChange={(e) => {
                                    setNewProxy({
                                      ...newProxy,
                                      customDomain: e.target.value,
                                    });
                                  }}
                                  sx={{ minWidth: 150 }}
                                />
                              </TableCell>
                              <TableCell>app.cloud.cbh.kth.se</TableCell>
                            </TableRow>
                            {editing?.customDomain && (
                              <TableRow>
                                <TableCell>TXT</TableCell>
                                <TableCell>
                                  {editing.customDomain ? (
                                    "_kthcloud." + editing.customDomain
                                  ) : (
                                    <Skeleton />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editing.customDomainSecret ? (
                                    editing.customDomainSecret
                                  ) : (
                                    <Skeleton />
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Typography variant="body2">
                        {t("setup-custom-domain-2-warning")}
                      </Typography>

                      <Typography variant="body2">
                        {t("setup-custom-domain-0-warning")}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={3}
                        alignItems={"center"}
                        useFlexGap
                      >
                        {editing?.customDomainStatus && (
                          <Chip
                            label={
                              t("admin-status") +
                              ": " +
                              sentenceCase(editing.customDomainStatus)
                            }
                          />
                        )}
                        {editing?.customDomain && (
                          <Button
                            color="error"
                            startIcon={<Iconify icon="mdi:delete" />}
                            onClick={() => {
                              handleCreate(true);
                              setExpanded(false);
                              setCreateDialogOpen(false);
                            }}
                          >
                            {t("clear-domain")}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            justifyContent={"space-between"}
            useFlexGap
            sx={{ p: 2 }}
          >
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={loading}
              size="large"
              startIcon={<Iconify icon="mdi:close" />}
            >
              {t("button-close")}
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCreate(false)}
              disabled={loading}
              size="large"
              startIcon={
                <Iconify
                  icon={editing ? "material-symbols:save" : "mdi:rocket-launch"}
                />
              }
            >
              {editing ? t("button-save") : t("deploy-proxy")}
            </Button>
          </Stack>
        </Drawer>
      )}
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
                                sx={{ whiteSpace: "nowrap" }}
                                target="_blank"
                                rel="noopener noreferrer"
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
                            <TableCell colSpan={2}>{t("deleting")}</TableCell>
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
                                  disabled
                                >
                                  <Iconify icon="mdi:pencil" />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  aria-label="delete proxy"
                                  component="label"
                                  disabled
                                >
                                  <Iconify icon="mdi:delete" />
                                </IconButton>
                              </Stack>
                            </TableCell>
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
                startIcon={<Iconify icon="mdi:plus" />}
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
    </>
  );
};

export default ProxyManager;
