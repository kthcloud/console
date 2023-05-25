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
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { enqueueSnackbar } from "notistack";
import useResource from "src/hooks/useResource";
import { updateVM } from "src/api/deploy/vms";
import { useKeycloak } from "@react-keycloak/web";

export default function PortManager({ vm }) {
  const [ports, setPorts] = useState([]);

  const [newPort, setNewPort] = useState("");
  const [newPortName, setNewPortName] = useState("");
  const [newPortProtocol, setNewPortProtocol] = useState("tcp");
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vm.ports) return;
    if (loading) return;

    setPorts(vm.ports);
  })

  const applyChanges = async (ports) => {
    if (!initialized) return;
    setLoading(true);
    setPorts(ports);

    try {
      const res = await updateVM(vm.id, { ports: ports }, keycloak.token);
      queueJob(res);
      enqueueSnackbar("Port changes saving...", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Could not update resource " + JSON.stringify(err), {
        variant: "error",
      });
    }finally{
      setLoading(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={"Port forwarding"}
        subheader={"Expose certain ports to the internet"}
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
                  <TableCell>{port.externalPort}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      aria-label="delete port mapping"
                      component="label"
                      disabled={loading}
                      onClick={() =>
                        applyChanges(
                          ports.filter((item) => item.id !== port.id)
                        )
                      }
                    >
                      <Iconify icon="mdi:delete" />
                    </IconButton>
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
