// mui
import {
  Card,
  Stack,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Link,
  Button,
  Tooltip,
  Box,
} from "@mui/material";

// hooks
import { useSnackbar } from "notistack";
import useResource from "../../hooks/useResource";
import { ChangeEvent, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";

// utils
import { filter } from "lodash";
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import Label from "../../components/Label";
import Scrollbar from "../../components/Scrollbar";
import ListHead from "./ListHead";
import ListToolbar from "./ListToolbar";
import SearchNotFound from "./SearchNotFound";
import JobList from "../../components/JobList";
import { Link as RouterLink } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Iconify from "../../components/Iconify";
import { deleteDeployment } from "../../api/deploy/deployments";
import { getReasonPhrase } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import { useTranslation } from "react-i18next";
import { Deployment, Resource, Uuid, Vm } from "../../types";
import { ThemeColor } from "../../theme/types";
import { deleteVM } from "../../api/deploy/vms";
import { AlertList } from "../../components/AlertList";
import { NoWrapTable as Table } from "../../components/NoWrapTable";
import { renderStale } from "../../components/render/Resource";

const descendingComparator = (
  a: Record<string, any>,
  b: Record<string, any>,
  orderBy: string
) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order: string, orderBy: string) => {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
};

const applySortFilter = (
  array: Resource[],
  comparator: (a: any, b: any) => number,
  query: string
): any[] => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    return comparator(a[0], b[0]);
  });
  if (query) {
    return filter(
      array,
      (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
};

export function Deploy() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [order, setOrder] = useState<"desc" | "asc">("asc");
  const [selected, setSelected] = useState<Uuid[]>([]);
  const [orderBy, setOrderBy] = useState<string>("name");
  const [filterName, setFilterName] = useState<string>("");
  const { userRows, initialLoad, queueJob, zones, gpuGroups, user } =
    useResource();
  const [filteredRows, setFilteredRows] = useState<Resource[]>(userRows);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setFilteredRows(
      applySortFilter(userRows, getComparator(order, orderBy), filterName)
    );
  }, [userRows, order, orderBy, filterName]);

  const TABLE_HEAD = [
    { id: "name", label: t("admin-name"), alignRight: false },
    { id: "type", label: t("resource-type"), alignRight: false },
    { id: "status", label: t("admin-status"), alignRight: false },
    { id: "zone", label: t("zone"), alignRight: false },
    { id: "", label: "", alignRight: true },
  ];

  const bulkDelete = async () => {
    if (!(initialized && keycloak.token)) return;
    setLoading(true);

    try {
      const promises = selected.map(async (id) => {
        if (userRows.find((row) => row.id === id)?.type === "vm") {
          const res = await deleteVM(keycloak.token!, id);
          queueJob(res);
          return;
        }

        if (userRows.find((row) => row.id === id)?.type === "deployment") {
          const res = await deleteDeployment(id, keycloak.token!);
          queueJob(res);
          return;
        }
      });

      await Promise.all(promises);
      enqueueSnackbar("Deleting resources", { variant: "info" });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error deleting resources: " + e, {
          variant: "error",
        })
      );
    } finally {
      setSelected([]);
      setLoading(false);
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = userRows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name: Uuid) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: Uuid[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const renderResourceButtons = (resource: Resource) => {
    if (
      resource.type === "deployment" &&
      Object.hasOwn(resource, "url") &&
      (resource as Deployment).url !== "" &&
      (resource as Deployment).private === false
    ) {
      return (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          useFlexGap={true}
          spacing={2}
        >
          <Link
            href={(resource as Deployment).url}
            target="_blank"
            rel="noreferrer"
            underline="none"
          >
            <Iconify icon="mdi:external-link" width={24} height={24} />
          </Link>
          <Link
            component={RouterLink}
            to={`/edit/${resource.type}/${resource.id}`}
          >
            <Iconify icon="mdi:pencil" width={24} height={24} />
          </Link>
        </Stack>
      );
    } else {
      return (
        <Link
          component={RouterLink}
          to={`/edit/${resource.type}/${resource.id}`}
        >
          <Iconify icon="mdi:pencil" width={24} height={24} />
        </Link>
      );
    }
  };

  const renderResourceType = (resource: Resource) => {
    if (resource.type === "vm" && (resource as Vm).gpu) {
      const group = gpuGroups?.find(
        (x) => x.id === (resource as Vm).gpu!.gpuGroupId
      );

      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Label
            variant="ghost"
            startIcon={
              <Iconify icon="carbon:virtual-machine" sx={{ opacity: 0.65 }} />
            }
          >
            VM
          </Label>
          {group ? (
            <Label
              variant="ghost"
              startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
            >
              {`${group.vendor.replace("Corporation", "").trim()} ${
                group.displayName
              }`}
            </Label>
          ) : (
            <Label
              variant="ghost"
              startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
            >
              {"GPU"}
            </Label>
          )}
        </Stack>
      );
    }

    if (resource.type === "vm") {
      return (
        <Stack direction="row" alignItems="center">
          <Label
            variant="ghost"
            startIcon={
              <Iconify icon="carbon:virtual-machine" sx={{ opacity: 0.65 }} />
            }
          >
            VM
          </Label>
        </Stack>
      );
    }

    if (resource.type === "deployment") {
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Label
            variant="ghost"
            color="info"
            startIcon={
              <Iconify icon="lucide:container" sx={{ opacity: 0.65 }} />
            }
          >
            Deployment
          </Label>
          {(resource as Deployment).private === true && (
            <Label
              variant="ghost"
              startIcon={<Iconify icon="mdi:eye-off" sx={{ opacity: 0.65 }} />}
            >
              {t("admin-visibility-private")}
            </Label>
          )}
        </Stack>
      );
    }
  };

  const renderResourceStatus = (row: Resource) => {
    const color: ThemeColor =
      (row.status === "resourceError" && "error") ||
      (row.status === "resourceUnknown" && "error") ||
      (row.status === "resourceMountFailed" && "error") ||
      (row.status === "resourceImagePullFailed" && "error") ||
      (row.status === "resourceCrashLoop" && "error") ||
      (row.status === "resourceStopped" && "warning") ||
      (row.status === "resourceRunning" && "success") ||
      "info";

    const statusMessage = sentenceCase(t(row.status).replace("resource", ""));

    return (
      <Label
        variant="ghost"
        color={color}
        startIcon={<Iconify icon="tabler:heartbeat" sx={{ opacity: 0.65 }} />}
        sx={
          row.status === "resourceStopping" ||
          row.status === "resourceStarting" ||
          row.status === "resourceProvisioning" ||
          row.status === "resourceScaling" ||
          row.status === "resourceBeingCreated" ||
          row.status === "resourceCreating" ||
          row.status === "resourceBeingDeleted" ||
          row.status === "resourceDeleting" ||
          row.status === "resourceRestarting"
            ? {
                animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
              }
            : null
        }
      >
        {row.type === "deployment" && row.error ? (
          <Tooltip enterTouchDelay={10} title={row.error}>
            <span>{statusMessage}</span>
          </Tooltip>
        ) : (
          statusMessage
        )}
      </Label>
    );
  };

  const renderStatusCode = (row: Resource) => {
    if (!(row.type === "deployment" && (row as Deployment).pingResult))
      return <></>;

    const codeType = parseInt(
      (row as Deployment).pingResult!.toString().charAt(0)
    );

    let color: ThemeColor = "info";
    if (codeType === 2 || codeType === 3) {
      color = "success";
    } else if (codeType === 4 || codeType === 5) {
      color = "error";
    }

    return (
      <Label
        variant="ghost"
        color={color}
        startIcon={
          <Iconify
            icon="mdi:transit-connection-variant"
            sx={{ opacity: 0.65 }}
          />
        }
      >
        {(row as Deployment).pingResult +
          " " +
          getReasonPhrase((row as Deployment).pingResult!)}
      </Label>
    );
  };

  const renderZone = (row: Resource) => {
    if (!row.zone || !zones) {
      return <></>;
    }

    const zone = zones.find(
      (zone) => zone.name === row.zone && zone.capabilities.includes(row.type)
    );

    return (
      <Label
        variant="ghost"
        startIcon={<Iconify icon="mdi:earth" sx={{ opacity: 0.65 }} />}
      >
        {zone?.description || row.zone}
      </Label>
    );
  };

  const renderShared = (row: Resource) => {
    if (row?.teams?.length === 0) return <></>;

    return (
      <Label
        variant="ghost"
        startIcon={<Iconify icon="mdi:account-group" sx={{ opacity: 0.65 }} />}
      >
        <Tooltip title={t("shared-in-group")}>
          <span>{t("shared")}</span>
        </Tooltip>
      </Label>
    );
  };

  useEffect(() => {
    if (
      user &&
      user.userData &&
      user.userData.find((d) => d.key === "onboarded")?.value !== "true"
    ) {
      navigate("/onboarding");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {!(initialLoad && user) ? (
        <LoadingPage />
      ) : (
        <Page title={t("menu-dashboard")}>
          <Container>
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              justifyContent="space-between"
              useFlexGap
              mb={3}
              spacing={5}
            >
              <Typography variant="h4">{t("menu-dashboard")}</Typography>

              <Box component="div" flexGrow={1} />
              {user.storageUrl && (
                <Button
                  component={Link}
                  href={user.storageUrl}
                  target="_blank"
                  rel="noreferrer"
                  startIcon={<Iconify icon="mdi:folder" />}
                >
                  {t("storage-manager")}
                </Button>
              )}
              {(user.role.permissions.includes("useGpus") || user.admin) && (
                <Button
                  component={RouterLink}
                  to={"/gpu"}
                  startIcon={<Iconify icon={"mdi:gpu"} />}
                >
                  {t("gpu-leases")}
                </Button>
              )}
              <Button
                component={RouterLink}
                to="/create"
                startIcon={<Iconify icon={"mdi:plus"} />}
              >
                {t("menu-create-new")}
              </Button>
            </Stack>

            <AlertList />
            <JobList />

            <Card sx={{ boxShadow: 20 }}>
              <ListToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={setFilterName}
                loading={loading}
                onDelete={bulkDelete}
              />

              <Scrollbar>
                <TableContainer sx={{ minWidth: 600, overflowX: "visible" }}>
                  <Table>
                    <ListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={userRows.length}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllClick={handleSelectAllClick}
                    />
                    <TableBody>
                      {filteredRows.map((row) => {
                        const isItemSelected = selected.indexOf(row.id) !== -1;

                        return (
                          <TableRow
                            hover
                            key={row.id}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                            onDoubleClick={() =>
                              navigate(`/edit/${row.type}/${row.id}`)
                            }
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={() => handleClick(row.id)}
                              />
                            </TableCell>
                            <TableCell align="left">
                              <Link
                                component={RouterLink}
                                to={`/edit/${row.type}/${row.id}`}
                                sx={{
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.name}
                              </Link>
                            </TableCell>
                            <TableCell align="left">
                              {renderResourceType(row)}
                            </TableCell>
                            <TableCell align="left">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                {renderResourceStatus(row)}
                                {renderStatusCode(row)}
                                {renderShared(row)}
                                {renderStale(row, t)}
                              </Stack>
                            </TableCell>
                            <TableCell align="left">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                {row.zone && zones && renderZone(row)}
                              </Stack>
                            </TableCell>

                            <TableCell align="right">
                              {renderResourceButtons(row)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>

                    {filteredRows.length <= 0 && (
                      <TableBody>
                        <TableRow>
                          <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            <SearchNotFound searchQuery={filterName} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
              </Scrollbar>
            </Card>
          </Container>
        </Page>
      )}
    </>
  );
}
