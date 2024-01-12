import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { updateDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";
import { useTranslation } from "react-i18next";

const StorageManager = ({ deployment, persistent, setPersistent }) => {
  const { t } = useTranslation();
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [newPersistentName, setNewPersistentName] = useState("");
  const [newPersistentAppPath, setNewPersistentAppPath] = useState("");
  const [newPersistentServerPath, setNewPersistentServerPath] = useState("");
  const [loading, setLoading] = useState(false);

  const applyChanges = async (storage) => {
    if (!initialized) return;
    setLoading(true);

    setPersistent(storage);

    try {
      const res = await updateDeployment(
        deployment.id,
        { volumes: storage },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar("Storage saving...", {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not update storage: " + e, {
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
        title={t("create-deployment-persistent")}
        subheader={t("create-deployment-persistent-subheader")}
      />
      <CardContent>
        <Stack
          direction="column"
          spacing={3}
          alignItems={"flex-start"}
          useFlexGap
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("admin-name")}</TableCell>
                    <TableCell>{t("create-deployment-app-path")}</TableCell>
                    <TableCell>{t("create-deployment-storage-path")}</TableCell>
                    <TableCell align="right">{t("admin-actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {persistent.map((persistentRecord) => (
                    <TableRow
                      key={"persistent_row_" + persistentRecord.name}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <b style={{ fontFamily: "monospace" }}>
                          {persistentRecord.name}
                        </b>
                      </TableCell>
                      <TableCell>
                        <b style={{ fontFamily: "monospace" }}>
                          {persistentRecord.appPath}
                        </b>
                      </TableCell>
                      <TableCell>
                        <b style={{ fontFamily: "monospace" }}>
                          {persistentRecord.serverPath}
                        </b>
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
                            aria-label="edit persistent record"
                            component="label"
                            onClick={() => {
                              setNewPersistentName(persistentRecord.name);
                              setNewPersistentAppPath(persistentRecord.appPath);
                              setNewPersistentServerPath(
                                persistentRecord.serverPath
                              );

                              setPersistent(
                                persistent.filter(
                                  (item) => item.name !== persistentRecord.name
                                )
                              );
                            }}
                            disabled={loading}
                          >
                            <Iconify icon="mdi:pencil" />
                          </IconButton>

                          <IconButton
                            color="error"
                            aria-label="delete"
                            component="label"
                            onClick={() =>
                              applyChanges(
                                persistent.filter(
                                  (item) => item.name !== persistentRecord.name
                                )
                              )
                            }
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
                        value={newPersistentName}
                        onChange={(e) => {
                          setNewPersistentName(e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label={t("create-deployment-app-path-label")}
                        variant="outlined"
                        value={newPersistentAppPath}
                        onChange={(e) => {
                          setNewPersistentAppPath(e.target.value);
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label={t("create-deployment-storage-path-label")}
                        variant="outlined"
                        value={newPersistentServerPath}
                        onChange={(e) => {
                          setNewPersistentServerPath(e.target.value);
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        aria-label="upload key"
                        component="label"
                        disabled={
                          !(
                            newPersistentAppPath &&
                            newPersistentServerPath &&
                            newPersistentName
                          )
                        }
                        onClick={() => {
                          if (
                            !(
                              newPersistentAppPath &&
                              newPersistentServerPath &&
                              newPersistentName
                            )
                          )
                            return;

                          applyChanges([
                            ...persistent,
                            {
                              name: newPersistentName,
                              appPath: newPersistentAppPath,
                              serverPath: newPersistentServerPath,
                            },
                          ]);

                          setNewPersistentName("");
                          setNewPersistentAppPath("");
                          setNewPersistentServerPath("");
                        }}
                      >
                        <Iconify icon="mdi:plus" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {deployment?.storageUrl !== "" && (
            <Button
              component={Link}
              href={deployment.storageUrl}
              target="_blank"
              rel="noreferrer"
              underline="none"
              startIcon={<Iconify icon="mdi:folder" />}
              variant="contained"
            >
              {t("storage-manager")}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StorageManager;
