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
  Card,
  CardContent,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  CardHeader,
  Button,
  IconButton,
} from "@mui/material";

import { AccountCircle, Email, NineKPlusTwoTone } from "@mui/icons-material";
import Iconify from "../../components/Iconify";

export default function PortManager({ resource }) {
  const mock = [
    {
      id: "12815800-e909-11ed-a05b-0242ac120003",
      name: "http",
      internalPort: 80,
      externalPort: 34098,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120004",
      name: "https",
      internalPort: 443,
      externalPort: 34099,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120005",
      name: "ssh",
      internalPort: 22,
      externalPort: 34022,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120006",
      name: "mysql",
      internalPort: 3306,
      externalPort: 34006,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120007",
      name: "mongodb",
      internalPort: 27017,
      externalPort: 34027,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120008",
      name: "redis",
      internalPort: 6379,
      externalPort: 34079,
    },
    {
      id: "12815800-e909-11ed-a05b-0242ac120009",
      name: "postgresql",
      internalPort: 5432,
      externalPort: 34032,
    },
  ];

  const [config, setConfig] = useState(mock);
  const [newPort, setNewPort] = useState("");
  const [newPortName, setNewPortName] = useState("");

  return (
    <Card sx={{mt:3}}>
      <CardHeader title={"Details"} />
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Internal</TableCell>
                <TableCell>External</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {config.map((port) => (
                <TableRow
                  key={"port_" + port.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {port.name}
                  </TableCell>
                  <TableCell>{port.internalPort}</TableCell>
                  <TableCell>{port.externalPort}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      aria-label="delete port mapping"
                      component="label"
                      onClick={() =>
                        setConfig(config.filter((item) => item.id !== port.id))
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

                      setNewPort("");
                      setNewPortName("");
                      setConfig([
                        ...config,
                        {
                            id: "12815800-e909-11ed-a05b-0242ac1202342" + config.length,
                            name: newPortName,
                            internalPort: newPort,
                            externalPort: 23000 + config.length,
                        },
                        ]);
                    }}
                  >
                    <Iconify icon="mdi:plus" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
