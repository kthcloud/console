import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { NoWrapTable as Table } from "../../components/NoWrapTable";
import Iconify from "../Iconify";
import { Dispatch, SetStateAction } from "react";
import { EnvVar } from "../../types";
import { useTranslation } from "react-i18next";

export type EnvironmentVariableSelectorProps = {
  envs: EnvVar[];
  setEnvs: Dispatch<SetStateAction<EnvVar[]>>;
  currentEnv: EnvVar;
  setCurrentEnv: Dispatch<SetStateAction<EnvVar>>;
};

export default function EnvironmentVariableSelector({
  envs,
  setEnvs,
  currentEnv,
  setCurrentEnv,
}: EnvironmentVariableSelectorProps) {
  const { t } = useTranslation();

  return (
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
                          setCurrentEnv({ name: env.name, value: env.value });
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
                          setEnvs(envs.filter((item) => item.name !== env.name))
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
                    value={currentEnv.name}
                    onChange={(e) => {
                      setCurrentEnv({ ...currentEnv, name: e.target.value });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label={t("create-deployment-env-value")}
                    variant="outlined"
                    value={currentEnv.value}
                    onChange={(e) => {
                      setCurrentEnv({ ...currentEnv, value: e.target.value });
                    }}
                    fullWidth
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    component="label"
                    disabled={
                      !(currentEnv.name != "" && currentEnv.value != "")
                    }
                    onClick={() => {
                      if (!(currentEnv.name != "" && currentEnv.value != ""))
                        return;

                      setEnvs([...envs, currentEnv]);

                      setCurrentEnv({ name: "", value: "" });
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
  );
}
