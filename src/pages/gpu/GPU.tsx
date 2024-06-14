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
import {
  createGpuLease,
  deleteGpuLease,
  updateGpuLease,
} from "../../api/deploy/gpuLeases";
import JobList from "../../components/JobList";
import {
  GpuGroupRead,
  GpuLeaseRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertList } from "../../components/AlertList";
import NoWrapTable from "../../components/NoWrapTable";

export const GPU = () => {
  const { t } = useTranslation();
  const { initialLoad, gpuLeases, gpuGroups, rows, queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const [selectVmDialogOpen, setSelectVmDialogOpen] = useState<boolean>(false);
  const [selectedLease, setSelectedLease] = useState<GpuLeaseRead | null>(null);
  const [selectedVmId, setSelectedVmId] = useState<Uuid | "">("");

  const [selectZoneDialogOpen, setSelectZoneDialogOpen] =
    useState<boolean>(false);
  const [selectedGpuName, setSelectedGpuName] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  interface GPUGroup extends GpuGroupRead {
    zones?: string[];
  }
  const [groupedGpus, setGroupedGpus] = useState<GPUGroup[]>([]);

  const { user } = useResource();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!user.role.permissions.includes("useGpus") && !user.admin) {
      enqueueSnackbar(t("not-permitted-to-gpu-page"), {
        variant: "error",
      });
      navigate("/deploy");
    }
  }, [user]);

  useEffect(() => {
    const grouped: GPUGroup[] = [];
    gpuGroups.forEach((group: GPUGroup) => {
      const existing: GPUGroup | undefined = grouped.find(
        (g) => g.name === group.name
      );
      if (existing) {
        if (!existing.zones) existing.zones = [];
        existing.zones.push(group.zone);
        existing.available += group.available;
        existing.total += group.total;
      } else {
        group.zones = [group.zone];
        grouped.push(group);
      }
    });
    setGroupedGpus(grouped);
  }, [gpuGroups]);

  const vms = () => rows.filter((r) => r.type === "vm");

  const leaseGPU = async (gpuGroupId: Uuid) => {
    if (!(initialized && keycloak.token)) return;

    try {
      const res = await createGpuLease(keycloak.token, {
        gpuGroupId,
        leaseForever: false,
      });
      queueJob(res);
    } catch (error: any) {
      console.log(error);
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error leasing: " + e, {
          variant: "error",
        })
      );
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
          <Stack
            direction="column"
            spacing={2}
            useFlexGap
            alignItems="flex-start"
          >
            <Typography variant="body2">{t("select-vm-gpu")}</Typography>
            <Stack direction="row" spacing={2} useFlexGap alignItems="center">
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
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
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
        open={selectZoneDialogOpen}
        onClose={() => setSelectZoneDialogOpen(false)}
      >
        <DialogTitle>{t("select-zone")}</DialogTitle>
        <DialogContent>
          <Stack
            direction="column"
            spacing={2}
            useFlexGap
            alignItems="flex-start"
          >
            <Typography variant="body2">{t("gpu-zone-subheader")}</Typography>

            <Stack direction="row" spacing={2} useFlexGap alignItems="center">
              <Select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value as Uuid)}
              >
                {gpuGroups
                  .filter((g) => g.name === selectedGpuName)
                  .map((row) => (
                    <MenuItem key={row.id} value={row.id}>
                      {row.zone}
                    </MenuItem>
                  ))}
              </Select>

              <Button
                onClick={() => {
                  leaseGPU(selectedZoneId);
                  setSelectZoneDialogOpen(false);
                }}
              >
                {t("apply")}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
      {!initialLoad ? (
        <LoadingPage />
      ) : (
        <Page title={t("resource-gpu")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4">{t("resource-gpu")}</Typography>

              <AlertList />
              <JobList />

              <Card>
                <CardHeader
                  title={t("gpu-leases")}
                  subheader={t("gpu-lease-subheader")}
                />
                <CardContent>
                  <TableContainer>
                    <NoWrapTable>
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
                              <TableCell>
                                {lease.leaseDuration + " h"}
                              </TableCell>
                              <TableCell>
                                {new Date(lease.createdAt).toLocaleString(
                                  navigator.language
                                )}
                              </TableCell>

                              <TableCell>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems={"center"}
                                  justifyContent={"space-between"}
                                >
                                  {lease.assignedAt ? (
                                    lease.active ? (
                                      <Typography variant="body2">
                                        {t("already-active")}
                                      </Typography>
                                    ) : vms().length === 0 ? (
                                      <Button
                                        component={Link}
                                        to="/create?type=vm"
                                        variant="contained"
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
                                  <Button
                                    onClick={() => {
                                      if (!keycloak.token) return;
                                      deleteGpuLease(
                                        keycloak.token,
                                        lease.id
                                      ).then((job) => {
                                        queueJob(job);
                                      });
                                    }}
                                    color="error"
                                  >
                                    {t("delete")}
                                  </Button>
                                </Stack>
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
                    </NoWrapTable>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title={t("gpu-types")}
                  subheader={t("gpu-groups-subheader")}
                />
                <CardContent>
                  <TableContainer>
                    <NoWrapTable>
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
                        {groupedGpus.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{`${group.vendor
                              .replace("Corporation", "")
                              .trim()} ${group.displayName}`}</TableCell>
                            <TableCell>{group.zones?.join(", ")}</TableCell>
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
                                  onClick={() => {
                                    if (group.zones?.length === 1) {
                                      leaseGPU(group.id);
                                      return;
                                    }
                                    setSelectedZoneId(group.id);
                                    setSelectedGpuName(group.name);
                                    setSelectZoneDialogOpen(true);
                                  }}
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
                    </NoWrapTable>
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
