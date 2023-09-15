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
import { createDeployment } from "src/api/deploy/deployments";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";
import RFC1035Input from "src/components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { GHSelect } from "./GHSelect";
import { errorHandler } from "src/utils/errorHandler";

export default function CreateDeployment({ finished }) {
  const [cleaned, setCleaned] = useState("");
  const { initialized, keycloak } = useKeycloak();

  const [envs, setEnvs] = useState([]);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  const [usePersistent, setUsePersistent] = useState(false);
  const [persistent, setPersistent] = useState([]);
  const [newPersistentName, setNewPersistentName] = useState("");
  const [newPersistentAppPath, setNewPersistentAppPath] = useState("");
  const [newPersistentServerPath, setNewPersistentServerPath] = useState("");

  const [accessToken, setAccessToken] = useState("");
  const [repo, setRepo] = useState("");
  const [initialName, setInitialName] = useState(
    faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
  );

  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = async (stay) => {
    if (!initialized) return;
    try {
      const job = await createDeployment(
        cleaned,
        envs,
        repo,
        persistent,
        accessToken,
        keycloak.token
      );
      finished(job, stay);
      if (stay) {
        setInitialName(
          faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
        );
        setCleaned("");
        setEnvs([]);
        setNewEnvName("");
        setNewEnvValue("");
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error creating deployment: " + e, {
          variant: "error",
        })
      );
    }
  };

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={"Create Deployment"}
          subheader={
            "Choose a nice name for your deployment, as it will also be its subdomain!"
          }
        />
        <CardContent>
          <RFC1035Input
            label={"Name"}
            placeholder="name"
            callToAction="Your deployment will be created with the name"
            type="Deployment name"
            variant="standard"
            cleaned={cleaned}
            setCleaned={setCleaned}
            initialValue={initialName}
          />
        </CardContent>
      </Card>

      <GHSelect setAccessToken={setAccessToken} repo={repo} setRepo={setRepo} />

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={"Set environment variables"}
          subheader={
            "Environment variables are accessible from inside your deployment and can be used to configure your application, store secrets, and more."
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Variable</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell align="right">Action</TableCell>
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
                      aria-label="upload key"
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
                      <Iconify icon="mdi:plus" />
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
          title={"Persistent storage"}
          subheader={
            "Persistent storage allows data to be stored and accessed across multiple deployments."
          }
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
            label="Persistent storage"
          />
          {usePersistent && (
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
                            setPersistent(
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

      <Stack justifyContent="flex-end" direction="row" spacing={3}>
        <Button onClick={() => handleCreate(true)} variant="outlined">
          Create and stay
        </Button>

        <Button onClick={() => handleCreate(false)} variant="contained">
          Create
        </Button>
      </Stack>
    </>
  );
}
