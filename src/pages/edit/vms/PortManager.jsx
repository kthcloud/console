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
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import useResource from "src/hooks/useResource";
import { updateVM } from "src/api/deploy/vms";
import { useKeycloak } from "@react-keycloak/web";
import CopyToClipboard from "react-copy-to-clipboard";
import { errorHandler } from "src/utils/errorHandler";

export default function PortManager({ vm }) {
  const [ports, setPorts] = useState([]);

  const [newPort, setNewPort] = useState("");
  const [newPortName, setNewPortName] = useState("");
  const [newPortProtocol, setNewPortProtocol] = useState("tcp");
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [publicIP, setPublicIP] = useState("");

  const isSamePort = (p1, p2) => {
    if (p1.internal !== p2.internal) return false;
    if (p1.name !== p2.name) return false;
    if (p1.protocol !== p2.protocol) return false;

    return true;
  };

  useEffect(() => {
    if (!vm.ports) return;
    if (loading) return;

    let loadingPorts = ports.filter((p) => !p.externalPort);
    loadingPorts = loadingPorts.filter(
      (p) => !vm.ports.find((p2) => isSamePort(p, p2))
    );

    let newPorts = Array.from(vm.ports).concat(loadingPorts);

    setPorts(newPorts);

    loadPublicIP();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm]);

  const loadPublicIP = async () => {
    const res = await fetch(
      "https://dns.google/resolve?name=vm.cloud.cbh.kth.se&type=A"
    );
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
      enqueueSnackbar("Port changes saving...", { variant: "info" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not change ports: " + e, {
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

    let newPorts = ports.filter((item) => !isSamePort(item, port));

    try {
      const res = await updateVM(vm.id, { ports: newPorts }, keycloak.token);
      queueJob(res);
      enqueueSnackbar("Port changes saving...", { variant: "info" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not remove port: " + e, {
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
        title={"Port forwarding"}
        subheader={
          <span>
            Expose certain ports to the internet
            <br />
            Access them at{" "}
            <CopyToClipboard text={"vm.cloud.cbh.kth.se"}>
              <Tooltip title="Copy to clipboard">
                <b
                  style={{
                    fontFamily: "monospace",
                    cursor: "pointer",
                    color: "#45515c",
                  }}
                >
                  vm.cloud.cbh.kth.se
                </b>
              </Tooltip>
            </CopyToClipboard>
            <span
              style={{
                fontFamily: "monospace",
                color: "#45515c",
              }}
            >
              {":[external_port]"}
            </span>
            {publicIP && (
              <>
                {" or "}
                <CopyToClipboard text={publicIP}>
                  <Tooltip title="Copy to clipboard">
                    <b
                      style={{
                        fontFamily: "monospace",
                        cursor: "pointer",
                        color: "#45515c",
                      }}
                    >
                      {publicIP}
                    </b>
                  </Tooltip>
                </CopyToClipboard>
                <span
                  style={{
                    fontFamily: "monospace",
                    color: "#45515c",
                  }}
                >
                  {":[external_port]"}
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
                <TableCell>Name</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>External</TableCell>
                <TableCell align="right">Action</TableCell>
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
                    {port.externalPort && (
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
                    )}
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
                    label="Name"
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
                      label="Protocol"
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
                    label="Internal port"
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
