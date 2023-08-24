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
} from "@mui/material";
import { useState } from "react";
import Iconify from "../../components/Iconify";
import { createDeployment } from "src/api/deploy/deployments";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";
import RFC1035Input from "src/components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { GHSelect } from "./GHSelect";

export default function CreateDeployment({ finished }) {
  const [cleaned, setCleaned] = useState("");
  const { initialized, keycloak } = useKeycloak();

  const [envs, setEnvs] = useState([]);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

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
    } catch (e) {
      enqueueSnackbar("Error creating deployment " + JSON.stringify(e), {
        variant: "error",
      });
    }
  };
  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title={"Create Deployment"} />
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
        <CardHeader title={"Set environment variables"} />
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
