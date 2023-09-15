import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Paper,
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

const StorageManager = ({ deployment, persistent, setPersistent }) => {
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
        variant: "success",
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
        title={"Persistent storage"}
        subheader={
          "Persistent storage allows data to be stored and accessed across multiple deployments"
        }
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>App path</TableCell>
                  <TableCell>Storage path</TableCell>
                  <TableCell align="right">Action</TableCell>
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
                      <IconButton
                        color="error"
                        aria-label="delete env"
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
                      value={newPersistentName}
                      onChange={(e) => {
                        setNewPersistentName(e.target.value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Path in your app"
                      variant="standard"
                      value={newPersistentAppPath}
                      onChange={(e) => {
                        setNewPersistentAppPath(e.target.value);
                      }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Path in your kthcloud storage"
                      variant="standard"
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
      </CardContent>
    </Card>
  );
};

export default StorageManager;
