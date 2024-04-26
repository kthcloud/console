import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// material
import {
  TextField,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Stack,
  useTheme,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import useResource from "../../../hooks/useResource";
import { updateVM } from "../../../api/deploy/v2/vms";
import { useKeycloak } from "@react-keycloak/web";
import { errorHandler } from "../../../utils/errorHandler";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";
import { Port, Vm } from "../../../types";
import { PortUpdate } from "go-deploy-types/types/v2/body";

export default function PortManager({ vm }: { vm: Vm }) {
  const { t } = useTranslation();

  const theme = useTheme();
  const [ports, setPorts] = useState<Port[]>([]);

  const [newPort, setNewPort] = useState<string>("");
  const [newPortName, setNewPortName] = useState<string>("");
  const [newPortProtocol, setNewPortProtocol] = useState<string>("tcp");
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [publicIP, setPublicIP] = useState("");
  const [deleting, setDeleting] = useState<string[]>([]);
  const [publicDomain, setPublicDomain] = useState("");

  const isSamePort = (p1: Port, p2: Port) => {
    if (p1.port !== p2.port) return false;
    if (p1.name !== p2.name) return false;
    if (p1.protocol !== p2.protocol) return false;

    return true;
  };

  useEffect(() => {
    if (!vm.ports) return;
    if (loading) return;

    setPorts(vm.ports);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm]);

  useEffect(() => {
    loadPublicIP();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPublicIP = async () => {
    if (!vm?.sshConnectionString) return;

    const domain = vm.sshConnectionString.split("@")[1].split(" ")[0];
    setPublicDomain(domain);

    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const json = await res.json();
    if (json.Answer) {
      setPublicIP(json.Answer[0].data);
    }
  };

  const applyChanges = async (newPorts: Port[]) => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);
    setPorts(newPorts);

    try {
      const res = await updateVM(keycloak.token, vm.id, {
        ports: newPorts as PortUpdate[],
      });
      queueJob(res);
      enqueueSnackbar(t("port-changes-saving"), { variant: "info" });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-change-ports") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePort = async (port: Port) => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);
    // remove externalport from port
    setPorts(
      ports.map((item) => {
        if (isSamePort(item, port)) {
          item.externalPort = undefined;
        }
        return item;
      })
    );

    if (port.name) setDeleting([...deleting, port.name]);

    const newPorts = ports.filter((item) => !isSamePort(item, port));

    try {
      const res = await updateVM(keycloak.token, vm.id, {
        ports: newPorts as PortUpdate[],
      });
      queueJob(res);
      enqueueSnackbar(t("port-changes-saving"), { variant: "info" });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-change-ports") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("port-forwarding")}
        subheader={
          <span>
            {t("port-forwarding-subheader-1")}
            <br />
            {t("port-forwarding-subheader-2")}
            <br />
            {t("port-forwarding-subheader-3")}

            {!publicIP ? (
              <>
                <CopyButton content={publicDomain} />
                <b
                  style={{
                    fontFamily: "monospace",
                    color: theme.palette.grey[700],
                  }}
                >
                  {publicDomain}
                </b>
                <span
                  style={{
                    fontFamily: "monospace",
                    color: theme.palette.grey[700],
                  }}
                >
                  {t("external_port")}
                </span>
              </>
            ) : (
              <>
                <CopyButton content={publicIP} />

                <b
                  style={{
                    fontFamily: "monospace",
                    color: theme.palette.grey[700],
                  }}
                >
                  {publicIP}
                </b>
                <span
                  style={{
                    fontFamily: "monospace",
                    color: theme.palette.grey[700],
                  }}
                >
                  {t("external_port")}
                </span>
              </>
            )}
          </span>
        }
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>{t("admin-name")}</TableCell>
                <TableCell>{t("protocol")}</TableCell>
                <TableCell>{t("internal")}</TableCell>
                <TableCell>{t("external")}</TableCell>
                <TableCell align="right">{t("admin-actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ports
                .sort((a, b) => {
                  if (a.port && b.port) {
                    return a.port - b.port;
                  }
                  return 0;
                })
                .map((port, index) => (
                  <TableRow
                    key={"port_" + index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {port.name}
                    </TableCell>
                    {port.protocol && (
                      <TableCell>{port.protocol.toUpperCase()}</TableCell>
                    )}
                    <TableCell>{port.port}</TableCell>
                    <TableCell>
                      {port.externalPort ? (
                        port.externalPort
                      ) : (
                        <Iconify
                          icon="eos-icons:three-dots-loading"
                          height={24}
                          width={24}
                        />
                      )}
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
                          aria-label="edit port"
                          component="label"
                          onClick={() => {
                            setNewPort(port.port?.toString() || "");
                            setNewPortName(port.name?.toString() || "");
                            setNewPortProtocol(port.protocol || "");
                            setPorts(
                              ports.filter((item) => !isSamePort(item, port))
                            );
                          }}
                          disabled={loading}
                        >
                          <Iconify icon="mdi:pencil" />
                        </IconButton>

                        <IconButton
                          color="error"
                          aria-label="delete port mapping"
                          component="label"
                          disabled={loading}
                          onClick={() => deletePort(port)}
                        >
                          <Iconify icon="mdi:delete" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              <TableRow
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell component="th" scope="row">
                  <TextField
                    label={t("admin-name")}
                    variant="outlined"
                    value={newPortName}
                    onChange={(e) => {
                      setNewPortName(e.target.value);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel id="protocol-label">Protocol</InputLabel>
                    <Select
                      value={newPortProtocol}
                      id="protocol-select"
                      label={t("protocol")}
                      onChange={(e) => {
                        setNewPortProtocol(e.target.value);
                      }}
                    >
                      <MenuItem value="tcp">TCP</MenuItem>
                      <MenuItem value="udp">UDP</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    label={t("internal-port")}
                    variant="outlined"
                    value={newPort}
                    onChange={(e) => {
                      setNewPort(e.target.value);
                    }}
                    fullWidth
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell align="right">
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <IconButton
                      color="primary"
                      aria-label="upload key"
                      component="label"
                      disabled={!newPort}
                      onClick={() => {
                        if (!(newPort && newPortName && newPortProtocol))
                          return;

                        applyChanges([
                          ...ports,
                          {
                            name: newPortName,
                            port: parseInt(newPort),
                            protocol: newPortProtocol,
                          },
                        ]);

                        setNewPort("");
                        setNewPortName("");
                        setNewPortProtocol("tcp");
                      }}
                    >
                      <Iconify icon="mdi:plus" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
