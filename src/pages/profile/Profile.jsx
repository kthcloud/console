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
import { useSnackbar } from "notistack";
import { sentenceCase } from "change-case";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
  Tooltip,
} from "@mui/material";

// components
import Page from "../../components/Page";

import { AccountCircle, Email } from "@mui/icons-material";
import { getUser, updateUser } from "src/api/deploy/users";
import { wasActivated } from "src/utils/eventHandler";
import { UserQuotas } from "./UserQuotas";
import { Input } from "@mui/base";

export function Profile() {
  const { keycloak, initialized } = useKeycloak();

  const [user, setUser] = useState(null);
  const [validationError, setValidationError] = useState({});

  const [newKey, setNewKey] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [changeInKeys, setChangeInKeys] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const loadProfile = async () => {
    if (!initialized) return -1;

    try {
      const response = await getUser(keycloak.subject, keycloak.token);
      setUser(response);
    } catch (error) {
      enqueueSnackbar("Error fetching profile: " + error, { variant: "error" });
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
    updateDetails("keys");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateDetails = async (mode) => {
    if (!(initialized && keycloak.authenticated)) return -1;

    try {
      const data = mode === "keys" ? { publicKeys: user.publicKeys } : user;
      const response = await updateUser(keycloak.subject, keycloak.token, data);
      console.log(response);
      setValidationError({});
      enqueueSnackbar("Successfully updated " + mode, { variant: "success" });
    } catch (error) {
      console.log(error);
      if (error.validationErrors) setValidationError(error.validationErrors);

      enqueueSnackbar("Error updating " + mode, {
        variant: "error",
      });

      // reset keys
      if (mode === "keys") {
        loadProfile();
      }
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
      <Stack
        spacing={3}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        useFlexGap={true}
      >
        <>{"..." + rawKey.substring(rawKey.length - 20, rawKey.length - 1)}</>
        <CopyToClipboard text={key}>
          <Tooltip title="Copy SSH key">
            <IconButton>
              <Iconify icon={"ic:round-content-copy"} width={24} height={24} />
            </IconButton>
          </Tooltip>
        </CopyToClipboard>
      </Stack>
    );
  };

  const getKeyFromFile = (path) => {
    if (!path) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setNewKey(reader.result);
    });
    reader.readAsText(path);
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

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={"Details"} />
                <CardContent>
                  {/* Form with user data pre filled */}
                  <Stack spacing={3}>
                    <TextField
                      label="Username"
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
                      error={validationError.username}
                      helperText={validationError.username}
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
                      error={validationError.email}
                      helperText={validationError.email}
                    />

                    <Stack
                      spacing={3}
                      direction={"row"}
                      flexWrap={"wrap"}
                      useFlexGap={true}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
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
                        onClick={() => updateDetails("profile")}
                        onKeyDown={(e) => {
                          wasActivated(e) && updateDetails("profile");
                        }}
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

              <UserQuotas user={user} />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={"SSH public keys"}
                  subheader={
                    <span>
                      Your public keys will be installed when creating VMs
                      <br />
                      Changes will not apply to existing VMs
                    </span>
                  }
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
                        {user.publicKeys.map((key, index) => (
                          <TableRow
                            key={"key_" + key.name + "_" + index}
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
                              error={validationError.name}
                              helperText={validationError.name}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction={"row"}
                              spacing={1}
                              alignItems={"center"}
                            >
                              <TextField
                                label="Key"
                                variant="standard"
                                value={newKey}
                                onChange={(e) => {
                                  setNewKey(e.target.value);
                                }}
                                fullWidth
                                error={Boolean(validationError.key)}
                                helperText={validationError.key}
                              />
                              <span>or</span>
                              <Input
                                type="file"
                                onChange={(e) => getKeyFromFile(e.target.files[0])}
                              />
                            </Stack>
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
