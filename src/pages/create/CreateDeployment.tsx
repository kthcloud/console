// @mui
import {
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  IconButton,
  Paper,
  Table,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import Iconify from "../../components/Iconify";
import { createDeployment } from "../../api/deploy/deployments";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";
import RFC1035Input from "../../components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { errorHandler } from "../../utils/errorHandler";
import useResource from "../../hooks/useResource";
import ZoneSelector from "./ZoneSelector";
import { useTranslation } from "react-i18next";
import { Volume } from "@kthcloud/go-deploy-types/types/v2/body";

export default function CreateDeployment({
  finished,
}: {
  finished: (job: any, stay: boolean) => void;
}) {
  const [cleaned, _setCleaned] = useState("");
  const { t } = useTranslation();

  const setCleaned = (value: string) => {
    if (rows.find((row) => row.name === value)) {
      enqueueSnackbar(
        t("admin-name") + " " + value + " " + t("create-already-taken"),
        {
          variant: "error",
        }
      );
      return;
    }

    _setCleaned(value);
  };

  const { initialized, keycloak } = useKeycloak();

  const { rows } = useResource();

  const [selectedZone, setSelectedZone] = useState("");
  const [image, setImage] = useState("");

  const [envs, setEnvs] = useState([{ name: "PORT", value: "8080" }]);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  const [usePersistent, setUsePersistent] = useState(false);
  const [persistent, setPersistent] = useState<Volume[]>([]);
  const [newPersistentName, setNewPersistentName] = useState("");
  const [newPersistentAppPath, setNewPersistentAppPath] = useState("");
  const [newPersistentServerPath, setNewPersistentServerPath] = useState("");

  const [initialName, setInitialName] = useState(
    import.meta.env.VITE_RELEASE_BRANCH
      ? ""
      : faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
  );
  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = async (stay: boolean) => {
    if (!(initialized && keycloak.token)) return;

    let newEnvs = envs;
    // Apply unsaved ENVS
    if (newEnvName && newEnvValue) {
      newEnvs = [
        ...envs,
        {
          name: newEnvName,
          value: newEnvValue,
        },
      ];

      setNewEnvName("");
      setNewEnvValue("");
    }

    let newPersistent = persistent;
    // Apply unsaved persitent
    if (newPersistentName && newPersistentAppPath && newPersistentServerPath) {
      newPersistent = [
        ...persistent,
        {
          name: newPersistentName,
          appPath: newPersistentAppPath,
          serverPath: newPersistentServerPath,
        },
      ];

      setNewPersistentName("");
      setNewPersistentAppPath("");
      setNewPersistentServerPath("");
    }

    try {
      const job = await createDeployment(
        cleaned,
        selectedZone,
        image,
        newEnvs,
        newPersistent,
        keycloak.token
      );
      finished(job, stay);
      if (stay) {
        if (!import.meta.env.VITE_RELEASE_BRANCH)
          setInitialName(
            faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
          );
        setCleaned("");
        setEnvs([]);
        setNewEnvName("");
        setNewEnvValue("");
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-creating-deployment") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment")}
          subheader={t("create-deployment-subheader")}
        />
        <CardContent>
          <RFC1035Input
            label={t("admin-name")}
            callToAction={t("create-deployment-name-warning")}
            type={t("create-deployment-name")}
            variant="outlined"
            cleaned={cleaned}
            setCleaned={setCleaned}
            initialValue={initialName}
            autofocus={!window.location.pathname.includes("onboarding")}
            enableRandomize={true}
          />
        </CardContent>
      </Card>

      <ZoneSelector
        alignment={"deployment"}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
      />

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment-image")}
          subheader={t("create-deployment-image-subheader")}
        />
        <CardContent>
          <TextField
            label={t("create-deployment-image")}
            variant="outlined"
            placeholder="mongo:latest"
            value={image}
            onChange={(e) => {
              setImage(e.target.value.trim());
            }}
            fullWidth
          />
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment-env")}
          subheader={t("create-deployment-env-subheader")}
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{t("create-deployment-env-key")}</TableCell>
                  <TableCell>{t("create-deployment-env-value")}</TableCell>
                  <TableCell align="right">{t("admin-actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {envs.map((env) => (
                  <TableRow
                    key={"env_row_" + env.name}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <b style={{ fontFamily: "monospace" }}>{env.name}</b>
                    </TableCell>
                    <TableCell>
                      <b style={{ fontFamily: "monospace" }}>{env.value}</b>
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
                          aria-label="edit env"
                          component="label"
                          onClick={() => {
                            setNewEnvName(env.name);
                            setNewEnvValue(env.value);
                            setEnvs(
                              envs.filter((item) => item.name !== env.name)
                            );
                          }}
                        >
                          <Iconify icon="mdi:pencil" />
                        </IconButton>

                        <IconButton
                          color="error"
                          aria-label="delete env"
                          component="label"
                          onClick={() =>
                            setEnvs(
                              envs.filter((item) => item.name !== env.name)
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
                    <IconButton
                      color="primary"
                      component="label"
                      disabled={!(newEnvName && newEnvValue)}
                      onClick={() => {
                        if (!(newEnvName && newEnvName)) return;

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
                      <Iconify icon="mdi:content-save" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment-persistent")}
          subheader={t("create-deployment-persistent-subheader")}
        />
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={usePersistent}
                onChange={(e) => setUsePersistent(e.target.checked)}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label={t("create-deployment-persistent")}
          />
          {usePersistent && (
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
                          >
                            <Iconify icon="mdi:pencil" />
                          </IconButton>
                          <IconButton
                            color="error"
                            aria-label="delete env"
                            component="label"
                            onClick={() =>
                              setPersistent(
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

                          setPersistent([
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
                        <Iconify icon="mdi:content-save" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={3}>
        <Button onClick={() => handleCreate(true)} variant="outlined">
          {t("create-and-stay")}
        </Button>

        <Button onClick={() => handleCreate(false)} variant="contained">
          {t("create-and-go")}
        </Button>
      </Stack>
    </>
  );
}
