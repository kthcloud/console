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
import {
  HttpProxyRead,
  PortCreate,
  PortRead,
  PortUpdate,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { NoWrapTable as Table } from "../../../components/NoWrapTable";

interface Proxy extends HttpProxyRead {
  port?: number;
}

interface Port extends PortRead {
  httpProxy?: Proxy;
}

interface NewProxy {
  name: string;
  customDomain?: string;
}

const ProxyManager = ({ vm }: { vm: Vm }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { queueJob, user, zones } = useResource();
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const [newProxy, setNewProxy] = useState<NewProxy>({
    name: "",
    customDomain: undefined,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [editing, setEditing] = useState<Proxy | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<number>(0);
  const [endpoint, setEndpoint] = useState<string>("");

  useEffect(() => {
    const endpoint = zones.find((z) => z.name === vm.zone)?.endpoints
      .deployment;

    if (!endpoint) return;
    setEndpoint(endpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

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

    const portsList = vm.ports as PortCreate[];

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
      const res = await updateVM(keycloak.token, vm.id, {
        ports: portsList as PortUpdate[],
      });
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
      const res = await updateVM(keycloak.token, vm.id, {
        ports: portsList as PortUpdate[],
      });
      queueJob(res);
      enqueueSnackbar(`${t("deleting-proxy")} ${proxy.name}...`, {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
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
          <Box component="div" sx={{ p: 2 }}>
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
                    onChange={(e) =>
                      setSelectedPort(parseInt(e.target.value.toString()))
                    }
                  >
                    {ports.map((port) => (
                      <MenuItem value={port.port} key={port.port}>
                        {port.name} (
                        {port.protocol && port.protocol.toUpperCase()}:
                        {port.port})
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
                      maxWidth={"500"}
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
                              <TableCell>{endpoint}</TableCell>
                            </TableRow>
                            {editing?.customDomain && (
                              <TableRow>
                                <TableCell>TXT</TableCell>
                                <TableCell>
                                  {editing.customDomain ? (
                                    "_kthcloud." + editing.customDomain.domain
                                  ) : (
                                    <Skeleton />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editing.customDomain ? (
                                    editing.customDomain.secret
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
                        {editing?.customDomain && (
                          <Chip
                            label={
                              t("admin-status") +
                              ": " +
                              sentenceCase(editing.customDomain.status)
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

          <Box component="div" sx={{ flexGrow: 1 }} />
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
                                  proxy.customDomain
                                    ? proxy.customDomain.url
                                    : proxy.url
                                }
                                sx={{ whiteSpace: "nowrap" }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {proxy.customDomain
                                  ? proxy.customDomain.url
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
                                    setNewProxy({
                                      name: proxy.name,
                                      customDomain: proxy.customDomain
                                        ? proxy.customDomain.domain
                                        : "",
                                    });
                                    setEditing(proxy);
                                    if (proxy.port) setSelectedPort(proxy.port);
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
                sx={{ pl: 3 }}
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
