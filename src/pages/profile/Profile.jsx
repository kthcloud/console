import { useState, useEffect } from "react";
import Iconify from "../../components/Iconify";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingPage from "../../components/LoadingPage";
import { useKeycloak } from "@react-keycloak/web";
import useAlert from "src/hooks/useAlert";
import { sentenceCase } from "change-case";

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
  Chip,
} from "@mui/material";

// components
import Page from "../../components/Page";

import { AccountCircle, Email } from "@mui/icons-material";
import useInterval from "src/hooks/useInterval";
import { getUser } from "src/api/deploy/users";

export function Profile() {
  const { keycloak, initialized } = useKeycloak();

  const [user, setUser] = useState(null);

  const [newKey, setNewKey] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [changeInKeys, setChangeInKeys] = useState(false);
  const { setAlert } = useAlert();

  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      setAlert("Error fetching profile: " + error, "error");
    }
  };

  // Run once on load
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!changeInKeys) return;

    console.log("updating keys");
    setChangeInKeys(false);
    updateDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateDetails = async () => {
    if (!initialized) return -1;

    try {
      const res = await fetch(
        process.env.REACT_APP_DEPLOY_API_URL + "/users/" + keycloak.subject,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + keycloak.token,
          },
          body: JSON.stringify(user),
        }
      );

      const response = await res.json();
      console.log(response);
      setAlert("Successfully saved details", "success");
    } catch (error) {
      setAlert("Error applying changes: " + error, "error");
    }
  };

  // return 15 characters of the key
  const renderKey = (key) => {
    let rawKey = key.replace("ssh-rsa ", "");
    rawKey = rawKey.replace("ssh-ed25519 ", "");
    rawKey = rawKey.replace("ssh-dss ", "");
    rawKey = rawKey.replace("ssh-ed448 ", "");
    rawKey = rawKey.replace("ssh-xmss ", "");
    rawKey = rawKey.replace("\n", " ");
    rawKey = rawKey.trim();
    rawKey = rawKey.split(" ")[0];

    return (
      rawKey.substring(0, 10) +
      " ... " +
      rawKey.substring(rawKey.length - 10, rawKey.length)
    );
  };

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title="Profile">
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                Profile
              </Typography>

              <Card sx={{boxShadow: 20}}>
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
                      value={user.username}
                      onChange={(e) => {
                        setUser({ ...user, username: e.target.value });
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

                    <Stack spacing={3} direction={"row"}>
                      {user.roles &&
                        user.roles.map((role, index) => (
                          <Chip
                            m={1}
                            key={"roles" + index}
                            icon={
                              <Iconify
                                icon="eos-icons:admin"
                                width={24}
                                height={24}
                              />
                            }
                            label={sentenceCase(role)}
                          />
                        ))}

                      <div style={{ flexGrow: "1" }} />

                      <Button
                        onClick={updateDetails}
                        variant="contained"
                        to="#"
                        startIcon={<Iconify icon="material-symbols:save" />}
                        sx={{ m: 1 }}
                      >
                        Update
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{boxShadow: 20}}>
                <CardHeader title={"Quotas"} />
                <CardContent>
                  <Stack spacing={3} direction={"row"}>
                    <Chip
                      m={1}
                      icon={
                        <Iconify icon="uil:processor" width={24} height={24} />
                      }
                      label={
                        <span>
                          CPU Cores
                          <b
                            style={{
                              fontFamily: "monospace",
                              marginLeft: ".75em",
                            }}
                          >
                            {user.usage.cpuCores  + "/" + user.quota.cpuCores}
                          </b>
                        </span>
                      }
                    />
                    <Chip
                      m={1}
                      icon={<Iconify icon="bi:memory" width={24} height={24} />}
                      label={
                        <span>
                          Memory GB
                          <b
                            style={{
                              fontFamily: "monospace",
                              marginLeft: ".75em",
                            }}
                          >
                            {user.usage.ram + "/" + user.quota.ram}
                          </b>
                        </span>
                      }
                    />
                    <Chip
                      m={1}
                      icon={
                        <Iconify icon="uil:processor" width={24} height={24} />
                      }
                      label={
                        <span>
                          Disk GB
                          <b
                            style={{
                              fontFamily: "monospace",
                              marginLeft: ".75em",
                            }}
                          >
                            {user.usage.diskSize + "/" + user.quota.diskSize}
                          </b>
                        </span>
                      }
                    />
                    <Chip
                      m={1}
                      icon={
                        <Iconify icon="mdi:kubernetes" width={24} height={24} />
                      }
                      label={
                        <span>
                          Kubernetes Deployments
                          <b
                            style={{
                              fontFamily: "monospace",
                              marginLeft: ".75em",
                            }}
                          >
                            {user.usage.deployments + "/" + user.quota.deployments}
                          </b>
                        </span>
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{boxShadow: 20}}> 
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
                            key={"key_" + key.name}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {key.name}
                            </TableCell>
                            <TableCell>{renderKey(key.key)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="error"
                                aria-label="delete key"
                                component="label"
                                onClick={() => {
                                  setUser({
                                    ...user,
                                    publicKeys: user.publicKeys.filter(
                                      (k) => k.name !== key.name
                                    ),
                                  });

                                  setChangeInKeys(true);
                                }}
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
                                if (!newKey) return;

                                setUser({
                                  ...user,
                                  publicKeys: user.publicKeys.concat({
                                    name: newKeyName,
                                    key: newKey,
                                  }),
                                });

                                setNewKey("");
                                setNewKeyName("");
                                setChangeInKeys(true);
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
      )}
    </>
  );
}
