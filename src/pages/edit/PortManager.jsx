import { useState } from "react";
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
} from "@mui/material";
import Iconify from "../../components/Iconify";

export default function PortManager({ resource, ports, setPorts }) {
  const [newPort, setNewPort] = useState("");
  const [newPortName, setNewPortName] = useState("");
  const [newPortProtocol, setNewPortProtocol] = useState("tcp");

  return (
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
              <TableCell>{port.protocol}</TableCell>
              <TableCell>{port.port}</TableCell>
              <TableCell>{port.externalPort}</TableCell>
              <TableCell align="right">
                <IconButton
                  color="error"
                  aria-label="delete port mapping"
                  component="label"
                  onClick={() =>
                    setPorts(ports.filter((item) => item.id !== port.id))
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
                <InputLabel id="disk-select-label">Disk size</InputLabel>
                <Select
                  defaultValue={newPortProtocol}
                  id="disk-select"
                  label="Disk size"
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
              <IconButton
                color="primary"
                aria-label="upload key"
                component="label"
                disabled={!newPort}
                onClick={() => {
                  console.log(newPort);
                  if (!newPort) return;

                  setPorts([
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
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
