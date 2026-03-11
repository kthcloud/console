import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
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
import { Volume } from "@kthcloud/go-deploy-types/types/v2/body";
import { useTranslation } from "react-i18next";

export type PersistentVolumeSelectorProps = {
  usePersistent: boolean;
  setUsePersistent: Dispatch<SetStateAction<boolean>>;
  volumes: Volume[];
  setVolumes: Dispatch<SetStateAction<Volume[]>>;
  currentVolume: Volume;
  setCurrentVolume: Dispatch<SetStateAction<Volume>>;
};

export default function PersistentVolumeSelector({
  usePersistent,
  setUsePersistent,
  volumes,
  setVolumes,
  currentVolume,
  setCurrentVolume,
}: PersistentVolumeSelectorProps) {
  const { t } = useTranslation();
  return (
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
                {volumes.map((persistentRecord) => (
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
                            setCurrentVolume(persistentRecord);

                            setVolumes(
                              volumes.filter(
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
                            setVolumes(
                              volumes.filter(
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
                      value={currentVolume.name}
                      onChange={(e) => {
                        setCurrentVolume({
                          ...currentVolume,
                          name: e.target.value,
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label={t("create-deployment-app-path-label")}
                      variant="outlined"
                      value={currentVolume.appPath}
                      onChange={(e) => {
                        setCurrentVolume({
                          ...currentVolume,
                          appPath: e.target.value,
                        });
                      }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label={t("create-deployment-storage-path-label")}
                      variant="outlined"
                      value={currentVolume.serverPath}
                      onChange={(e) => {
                        setCurrentVolume({
                          ...currentVolume,
                          serverPath: e.target.value,
                        });
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
                          currentVolume.appPath &&
                          currentVolume.serverPath &&
                          currentVolume.name
                        )
                      }
                      onClick={() => {
                        if (
                          !(
                            currentVolume.appPath &&
                            currentVolume.serverPath &&
                            currentVolume.name
                          )
                        )
                          return;

                        setVolumes([...volumes, currentVolume]);

                        setCurrentVolume({
                          name: "",
                          appPath: "",
                          serverPath: "",
                        });
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
  );
}
