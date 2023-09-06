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
  CircularProgress,
  CardContent,
  CardHeader,
  Card,
  Typography,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { updateDeployment } from "src/api/deploy/deployments";
import { enqueueSnackbar } from "notistack";
import useResource from "src/hooks/useResource";
import { useKeycloak } from "@react-keycloak/web";
import { errorHandler } from "src/utils/errorHandler";

export default function EnvManager({ deployment }) {
  const [envs, setEnvs] = useState([]);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deployment.envs) return;
    if (loading) return;
    setEnvs(deployment.envs);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyChanges = async (envs) => {
    if (!initialized) return;
    setLoading(true);

    setEnvs(envs);

    try {
      const res = await updateDeployment(
        deployment.id,
        { envs: envs },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar("Environment variables saving...", {
        variant: "success",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not update environment variables: " + e, {
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
        title={"Environment variables"}
        subheader={
          "These values will be accessible from inside your application"
        }
      />
      <CardContent>
        <Typography variant="body" color="text.secondary">
          Your app needs to listen to $DEPLOY_APP_PORT
        </Typography>
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
              {Array.isArray(envs) &&
                envs.map((env) => (
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
                          applyChanges(
                            envs.filter((item) => item.name !== env.name)
                          )
                        }
                        disabled={loading}
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
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <IconButton
                      color="primary"
                      aria-label="add env"
                      component="label"
                      disabled={!newEnvName || !newEnvValue}
                      onClick={() => {
                        if (!newEnvName || !newEnvValue) return;

                        applyChanges([
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
