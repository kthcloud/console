import { useState } from "react";
import Iconify from "../components/Iconify";
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

// components
import Page from "../components/Page";

import { AccountCircle, Email, NineKPlusTwoTone } from "@mui/icons-material";

export default function Profile() {
  const userData = {
    name: "John Doe",
    email: "john@kthcloud.com",
    vmQuota: 3,
    kubernetesQuota: 10,
    publicKeys: [
      {
        id: "1",
        name: "thinkpad",
        key: "ssh-rsa AAAAB3NzaC1yc2EAA",
      },
    ],
  };

  const [user, setUser] = useState(userData);

  const [newKey, setNewKey] = useState("");
  const [newKeyName, setNewKeyName] = useState("");

  return (
    <Page title="Profile">
      <Container>
        <Stack spacing={3}>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>

          <Card>
            <CardHeader title={"Details"} />
            <CardContent>
              {/* Form with user data pre filled */}
              <Stack spacing={3}>
                <TextField
                  label="Name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                  value={user.name}
                  onChange={(e) => {
                    setUser({ ...user, name: e.target.value });
                  }}
                />

                <TextField
                  label="Email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                  value={user.email}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="VM Quota"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="carbon:virtual-machine"
                            width={24}
                            height={24}
                          />
                        </InputAdornment>
                      ),
                    }}
                    variant="standard"
                    value={user.vmQuota}
                    disabled
                  />

                  <TextField
                    label="Kubernetes Quota"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="mdi:kubernetes"
                            width={24}
                            height={24}
                          />
                        </InputAdornment>
                      ),
                    }}
                    variant="standard"
                    value={user.kubernetesQuota}
                    disabled
                  />

                  <div style={{ flexGrow: "1" }} />

                  <Button
                    onClick={() => console.log("Updated")}
                    variant="contained"
                    to="#"
                    startIcon={<Iconify icon="material-symbols:save" />}
                  >
                    Update
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={"SSH keys"}
              subheader={"Upload your public keys to enable SSH"}
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user.publicKeys.map((key) => (
                      <TableRow
                        key={"key_" + key.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {key.name}
                        </TableCell>
                        <TableCell>{key.key}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            aria-label="delete key"
                            component="label"
                            onClick={() =>
                              setUser({
                                ...user,
                                publicKeys: user.publicKeys.filter(
                                  (k) => k.id !== key.id
                                ),
                              })
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
                          value={newKeyName}
                          onChange={(e) => {
                            setNewKeyName(e.target.value);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="Key"
                          variant="standard"
                          value={newKey}
                          onChange={(e) => {
                            setNewKey(e.target.value);
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          aria-label="upload key"
                          component="label"
                          disabled={!newKey}
                          onClick={() => {
                            console.log(newKey);
                            if (!newKey) return;

                            setUser({
                              ...user,
                              publicKeys: user.publicKeys.concat({
                                id: Math.random().toString(36),
                                name: newKeyName,
                                key: newKey,
                              }),
                            });

                            setNewKey("");
                            setNewKeyName("");
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
        </Stack>
      </Container>
    </Page>
  );
}
