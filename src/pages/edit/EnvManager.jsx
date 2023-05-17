import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// material
import { TextField, IconButton } from "@mui/material";
import Iconify from "../../components/Iconify";

export default function EnvManager({ resource, envs, setEnvs }) {

  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");


  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Value</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(envs) && envs.map((env) => (
            <TableRow
              key={"env" + env.name}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {env.name}
              </TableCell>
              <TableCell>{env.value}</TableCell>
              <TableCell align="right">
                <IconButton
                  color="error"
                  aria-label="delete env"
                  component="label"
                  onClick={() =>
                    setEnvs(envs.filter((item) => item.name !== env.name))
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
                value={newEnvName}
                onChange={(e) => {
                  setNewEnvName(e.target.value);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                label="Value"
                variant="standard"
                value={newEnvValue}
                onChange={(e) => {
                  setNewEnvValue(e.target.value);
                }}
                fullWidth
              />
            </TableCell>
            <TableCell align="right">
              <IconButton
                color="primary"
                aria-label="add env"
                component="label"
                disabled={!newEnvName || !newEnvValue}
                onClick={() => {
                  if (!newEnvName || !newEnvValue) return;

                  setEnvs([
                    ...envs,
                    {
                      name: newEnvName,
                      value: newEnvValue,
                    },
                  ]);

                  setNewEnvName("");
                  setNewEnvValue("");
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
