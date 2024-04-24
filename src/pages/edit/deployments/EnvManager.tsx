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
  Stack,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { updateDeployment } from "../../../api/deploy/deployments";
import { enqueueSnackbar } from "notistack";
import useResource from "../../../hooks/useResource";
import { useKeycloak } from "@react-keycloak/web";
import { errorHandler } from "../../../utils/errorHandler";
import { useTranslation } from "react-i18next";
import { Deployment } from "../../../types";
import { Env } from "go-deploy-types/types/v1/body";

export default function EnvManager({ deployment }: { deployment: Deployment }) {
  const { t } = useTranslation();
  const [envs, setEnvs] = useState<Env[]>([]);
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

  const applyChanges = async (envs: Env[]) => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);

    setEnvs(envs);

    try {
      const res = await updateDeployment(
        deployment.id,
        { envs: envs },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("environment-variables-saving"), {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-save-environment-variables") + e, {
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
        title={t("create-deployment-env")}
        subheader={t("create-deployment-env-subheader")}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin-name")}</TableCell>
                  <TableCell>{t("create-deployment-env-value")}</TableCell>
                  <TableCell align="right">{t("admin-actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(envs) &&
                  envs.map((env) => (
                    <TableRow
                      key={"env" + env.name + env.value}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {env.name}
                      </TableCell>
                      <TableCell>{env.value}</TableCell>
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
                            aria-label="edit env"
                            component="label"
                            onClick={() => {
                              setNewEnvName(env.name);
                              setNewEnvValue(env.value);
                              setEnvs(
                                envs.filter((item) => item.name !== env.name)
                              );
                            }}
                            disabled={loading}
                          >
                            <Iconify icon="mdi:pencil" />
                          </IconButton>

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
                      value={newEnvName}
                      onChange={(e) => {
                        setNewEnvName(e.target.value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label={t("create-deployment-env-value")}
                      variant="outlined"
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
        )}
      </CardContent>
    </Card>
  );
}
