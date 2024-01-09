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
  Tooltip,
  Stack,
  useTheme,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import useResource from "src/hooks/useResource";
import { updateVM } from "src/api/deploy/vms";
import { useKeycloak } from "@react-keycloak/web";
import CopyToClipboard from "react-copy-to-clipboard";
import { errorHandler } from "src/utils/errorHandler";
import { useTranslation } from "react-i18next";

export default function PortManager({ vm }) {
  const { t } = useTranslation();

  const theme = useTheme();
  const [ports, setPorts] = useState([]);

  const [newPort, setNewPort] = useState("");
  const [newPortName, setNewPortName] = useState("");
  const [newPortProtocol, setNewPortProtocol] = useState("tcp");
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [publicIP, setPublicIP] = useState("");
  const [deleting, setDeleting] = useState([]);
  const [publicDomain, setPublicDomain] = useState("");

  const isSamePort = (p1, p2) => {
    if (p1.internal !== p2.internal) return false;
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
  }, []);

  const loadPublicIP = async () => {
    if (!vm?.connectionString) return;

    const domain = vm.connectionString.split("@")[1].split(" ")[0];
    setPublicDomain(domain);

    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const json = await res.json();
    if (json.Answer) {
      setPublicIP(json.Answer[0].data);
    }
  };

  const applyChanges = async (newPorts) => {
    if (!initialized) return;
    setLoading(true);
    setPorts(newPorts);

    try {
      const res = await updateVM(vm.id, { ports: newPorts }, keycloak.token);
      queueJob(res);
      enqueueSnackbar(t("port-changes-saving"), { variant: "info" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-change-ports") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePort = async (port) => {
    if (!initialized) return;
    setLoading(true);
    // remove externalport from port
    setPorts(
      ports.map((item) => {
        if (isSamePort(item, port)) {
          item.externalPort = null;
        }
        return item;
      })
    );

    setDeleting([...deleting, port.name]);

    let newPorts = ports.filter((item) => !isSamePort(item, port));

    try {
      const res = await updateVM(vm.id, { ports: newPorts }, keycloak.token);
      queueJob(res);
      enqueueSnackbar(t("port-changes-saving"), { variant: "info" });
    } catch (error) {
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
            <CopyToClipboard text={publicDomain}>
              <Tooltip enterTouchDelay={10} title={t("copy-to-clipboard")}>
                <b
                  style={{
                    fontFamily: "monospace",
                    cursor: "pointer",
                    color: theme.palette.grey[700],
                  }}
                >
                  {publicDomain}
                </b>
              </Tooltip>
            </CopyToClipboard>
            <span
              style={{
                fontFamily: "monospace",
                color: theme.palette.grey[700],
              }}
            >
              {t("external_port")}
            </span>
            {publicIP && (
              <>
                {" " + t("or") + " "}
                <CopyToClipboard text={publicIP}>
                  <Tooltip enterTouchDelay={10} title="Copy to clipboard">
                    <b
                      style={{
                        fontFamily: "monospace",
                        cursor: "pointer",
                        color: theme.palette.grey[700],
                      }}
                    >
                      {publicIP}
                    </b>
                  </Tooltip>
                </CopyToClipboard>
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
              {ports.map((port, index) => (
                <TableRow
                  key={"port_" + index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {port.name}
                  </TableCell>
                  <TableCell>{port.protocol.toUpperCase()}</TableCell>
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
                          setNewPort(port.port);
                          setNewPortName(port.name);
                          setNewPortProtocol(port.protocol);
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
                    variant="standard"
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
                    variant="standard"
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
                        if (!newPort) return;

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
