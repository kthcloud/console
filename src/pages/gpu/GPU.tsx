import { useTranslation } from "react-i18next";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import useResource from "../../hooks/useResource";
import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Iconify from "../../components/Iconify";
import { useKeycloak } from "@react-keycloak/web";
import { Uuid } from "../../types";
import { errorHandler } from "../../utils/errorHandler";
import { enqueueSnackbar } from "notistack";
import { createGpuLease, updateGpuLease } from "../../api/deploy/v2/gpuLeases";
import JobList from "../../components/JobList";
import { GpuLeaseRead } from "go-deploy-types/types/v2/body";
import { useState } from "react";
import { Link } from "react-router-dom";

export const GPU = () => {
  const { t } = useTranslation();
  const { initialLoad, gpuLeases, gpuGroups, rows, queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [selectVmDialogOpen, setSelectVmDialogOpen] = useState<boolean>(false);
  const [selectedLease, setSelectedLease] = useState<GpuLeaseRead | null>(null);
  const [selectedVmId, setSelectedVmId] = useState<Uuid | "">("");

  const vms = () => rows.filter((r) => r.type === "vm");

  const leaseGPU = async (gpuGroupId: Uuid) => {
    if (!(initialized && keycloak.token)) return;

    try {
      const res = await createGpuLease(keycloak.token, {
        gpuGroupId,
        leaseForever: false,
      });
      if (res) {
        queueJob(res);
      } else {
        enqueueSnackbar(t("error-updating") + t("gpu-lease"), {
          variant: "error",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(errorHandler(e), { variant: "error" });
    }
  };

  const activateLease = async () => {
    if (!(initialized && keycloak.token && selectedLease && selectedVmId))
      return;

    try {
      const res = await updateGpuLease(keycloak.token, selectedLease.id, {
        vmId: selectedVmId,
      });
      if (res) {
        queueJob(res);
        console.log(res);
      } else {
        enqueueSnackbar(t("error-updating") + t("gpu-lease"), {
          variant: "error",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(errorHandler(e), { variant: "error" });
    } finally {
      setSelectVmDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            sx: {
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(3px)",
            },
          },
        }}
        open={selectVmDialogOpen}
        onClose={() => setSelectVmDialogOpen(false)}
      >
        <DialogTitle>{t("select-vm")}</DialogTitle>
        <DialogContent>
          <Select
            value={selectedVmId}
            onChange={(e) => setSelectedVmId(e.target.value as Uuid)}
          >
            {rows
              .filter((r) => r.type === "vm")
              .map((row) => (
                <MenuItem key={row.id} value={row.id}>
                  {row.name}
                </MenuItem>
              ))}
          </Select>

          <Button onClick={() => activateLease()}>{t("activate")}</Button>
        </DialogContent>
      </Dialog>
      {!initialLoad ? (
        <LoadingPage />
      ) : (
        <Page title={t("resource-gpu")}>
          <Container>
            <Stack spacing={3}>
              <JobList />
              <Typography variant="h4">{t("resource-gpu")}</Typography>
              <Card>
                <CardHeader title={t("gpu-types")} />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("zone")}</TableCell>
                          <TableCell>
                            {t("available") + " / " + t("total")}
                          </TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gpuGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{`${group.vendor
                              .replace("Corporation", "")
                              .trim()} ${group.displayName}`}</TableCell>
                            <TableCell>{group.zone}</TableCell>
                            <TableCell>
                              {group.available + " / " + group.total}
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                useFlexGap
                                alignItems={"center"}
                                spacing={1}
                                justifyContent={"flex-start"}
                              >
                                <Button
                                  startIcon={<Iconify icon="mdi:human-queue" />}
                                  variant="outlined"
                                  onClick={() => leaseGPU(group.id)}
                                >
                                  {t("wait-in-line")}
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                        {gpuGroups.length === 0 && (
                          <TableRow>
                            <TableCell>{t("nothing-to-see-here")}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title={t("gpu-leases")} />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("admin-name")}</TableCell>
                          <TableCell>{t("position-in-line")}</TableCell>
                          <TableCell>{t("lease-duration")}</TableCell>
                          <TableCell>{t("created-at")}</TableCell>
                          <TableCell>{t("admin-actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gpuLeases.map((lease) => {
                          const gpuGroup = gpuGroups.find(
                            (group) => group.id === lease.gpuGroupId
                          );
                          if (!gpuGroup) return null;
                          return (
                            <TableRow key={lease.id}>
                              <TableCell>
                                {gpuGroup.vendor
                                  .replace("Corporation", "")
                                  .trim() +
                                  " " +
                                  gpuGroup.displayName}
                              </TableCell>
                              <TableCell>{lease.queuePosition}</TableCell>
                              <TableCell>{/*lease.LeaseDuration*/}</TableCell>
                              <TableCell>
                                {new Date(lease.createdAt).toLocaleString(
                                  navigator.language
                                )}
                              </TableCell>

                              <TableCell>
                                {lease.assignedAt ? (
                                  lease.active ? (
                                    <Typography variant="body2">
                                      {t("already-active")}
                                    </Typography>
                                  ) : vms().length === 0 ? (
                                    <Button
                                      component={Link}
                                      to="/create?type=vm"
                                    >
                                      {t("create-a-vm-first")}
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => {
                                        setSelectedLease(lease);
                                        setSelectVmDialogOpen(true);
                                        setSelectedVmId(vms()[0].id || "");
                                      }}
                                    >
                                      {t("activate")}
                                    </Button>
                                  )
                                ) : (
                                  <Tooltip title={t("waiting-for-gpu-lease")}>
                                    <Typography variant="body2">
                                      {t("relax-and-enjoy-the-sun")}
                                    </Typography>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {gpuLeases.length === 0 && (
                          <TableRow>
                            <TableCell>{t("nothing-to-see-here")}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};
