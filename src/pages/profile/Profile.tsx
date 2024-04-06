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
import CopyButton from "../../components/CopyButton";

// material
import {
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Stack,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Link,
} from "@mui/material";

// components
import Page from "../../components/Page";

import { AccountCircle, Email } from "@mui/icons-material";
import { getUser, updateUser } from "../../api/deploy/users";
import { UserQuotas } from "./UserQuotas";
import { errorHandler } from "../../utils/errorHandler";
import JobList from "../../components/JobList";
import { ResetOnboarding } from "./ResetOnboarding";
import { useTranslation } from "react-i18next";

export function Profile() {
  const { t } = useTranslation();
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
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, {
          variant: "error",
        })
      );
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

    setChangeInKeys(false);
    updateDetails("keys");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateDetails = async (mode) => {
    if (!(initialized && keycloak.authenticated)) return -1;

    try {
      const data = mode === "keys" ? { publicKeys: user.publicKeys } : user;
      await updateUser(keycloak.subject, keycloak.token, data);
      setValidationError({});
      enqueueSnackbar(t("successfully-updated") + " " + mode, {
        variant: "success",
      });
    } catch (error) {
      if (error.validationErrors) setValidationError(error.validationErrors);

      enqueueSnackbar(t("error-updating") + mode, {
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
        <Typography type={"body2"} sx={{ fontFamily: "monospace" }}>
          {"..." + rawKey.substring(rawKey.length - 20, rawKey.length - 1)}
        </Typography>
        <CopyButton content={key} />
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
        <Page title={t("profile")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("profile")}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={t("details")}
                  subheader={
                    <>
                      {t("gravatar")}
                      <Link
                        href="https://gravatar.com/connect/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        gravatar.com
                      </Link>
                    </>
                  }
                />
                <CardContent>
                  <Stack spacing={3}>
                    <Stack
                      spacing={3}
                      direction={"row"}
                      flexWrap={"wrap"}
                      useFlexGap={true}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Chip
                        m={1}
                        icon={<AccountCircle />}
                        label={user.username}
                      />

                      <Chip m={1} icon={<Email />} label={user.email} />

                      {user.role && (
                        <Chip
                          m={1}
                          icon={
                            <Iconify
                              icon="eos-icons:admin"
                              width={24}
                              height={24}
                            />
                          }
                          label={sentenceCase(user.role.description)}
                        />
                      )}

                      {user.admin && (
                        <Chip
                          m={1}
                          icon={
                            <Iconify
                              icon="eos-icons:admin"
                              width={24}
                              height={24}
                            />
                          }
                          label={"Admin"}
                        />
                      )}

                      <div style={{ flexGrow: "1" }} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <UserQuotas user={user} />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={t("ssh-public-keys")}
                  subheader={
                    <span>
                      {t("ssh-public-keys-subheader-1")}
                      <br />
                      {t("ssh-public-keys-subheader-2")}({t("e-g") + " "}
                      <span style={{ fontFamily: "monospace" }}>
                        id_rsa.pub
                      </span>
                      )
                    </span>
                  }
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("key")}</TableCell>
                          <TableCell align="right">
                            {t("admin-actions")}
                          </TableCell>
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
                              <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                alignItems={"center"}
                                justifyContent={"flex-end"}
                              >
                                <IconButton
                                  color="primary"
                                  aria-label="edit key"
                                  component="label"
                                  onClick={() => {
                                    setNewKey(key.key);
                                    setNewKeyName(key.name);
                                    setUser({
                                      ...user,
                                      publicKeys: user.publicKeys.filter(
                                        (k) => k.name !== key.name
                                      ),
                                    });
                                  }}
                                >
                                  <Iconify icon="mdi:pencil" />
                                </IconButton>
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
                                label={t("key")}
                                variant="outlined"
                                value={newKey}
                                onChange={(e) => {
                                  setNewKey(e.target.value);
                                }}
                                fullWidth
                                error={Boolean(validationError.key)}
                                helperText={validationError.key}
                              />
                              <span>{t("or")}</span>

                              <Button
                                variant="contained"
                                component="label"
                                sx={{ whiteSpace: "nowrap", px: 3 }}
                              >
                                {t("select-key-file")}
                                <input
                                  type="file"
                                  hidden
                                  onChange={(e) =>
                                    getKeyFromFile(e.target.files[0])
                                  }
                                />
                              </Button>
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

              <ResetOnboarding />
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
