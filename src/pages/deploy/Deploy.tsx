// mui
import {
  Card,
  Table,
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
} from "@mui/material";

// hooks
import { useSnackbar } from "notistack";
import useResource from "/src/hooks/useResource";
import { useEffect, useState } from "react";
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
import { deleteDeployment } from "/src/api/deploy/deployments";
import { deleteVM } from "/src/api/deploy/vms";
import { getReasonPhrase } from "http-status-codes";
import { errorHandler } from "/src/utils/errorHandler";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const applySortFilter = (array, comparator, query) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
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

  const [order, setOrder] = useState("asc");

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState("name");

  const [filterName, setFilterName] = useState("");

  const { userRows, user, initialLoad, queueJob, zones } = useResource();

  const [filteredRows, setFilteredRows] = useState(userRows);

  const [loading, setLoading] = useState(false);

  const { keycloak, initialized } = useKeycloak();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
    if (!initialized) return;
    setLoading(true);

    try {
      const promises = selected.map(async (id) => {
        if (userRows.find((row) => row.id === id).type === "vm") {
          const res = await deleteVM(id, keycloak.token);
          queueJob(res);
          return;
        }
        if (userRows.find((row) => row.id === id).type === "deployment") {
          const res = await deleteDeployment(id, keycloak.token);
          queueJob(res);
          return;
        }
      });

      await Promise.all(promises);
      enqueueSnackbar("Deleting resources", { variant: "info" });
    } catch (error) {
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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = userRows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
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

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const renderResourceButtons = (resource) => {
    if (
      resource.type === "deployment" &&
      Object.hasOwn(resource, "url") &&
      resource.url !== "" &&
      resource.private === false
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
            href={resource.url}
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

  const renderResourceType = (resource) => {
    if (resource.type === "vm" && resource.gpu) {
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

          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
          >
            {"NVIDIA " + resource.gpu.name}
          </Label>
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
          {resource.private === true && (
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

    return resource.type;
  };

  const renderResourceStatus = (row) => {
    let color =
      (row.status === "resourceError" && "error") ||
      (row.status === "resourceUnknown" && "error") ||
      (row.status === "resourceStopped" && "warning") ||
      (row.status === "resourceBeingCreated" && "info") ||
      (row.status === "resourceBeingDeleted" && "info") ||
      (row.status === "resourceStarting" && "info") ||
      (row.status === "resourceStopping" && "info") ||
      (row.status === "resourceRunning" && "success");

    if (!color) color = "info";

    let statusMessage = t(row.status);

    return (
      <Label
        variant="ghost"
        color={color}
        startIcon={<Iconify icon="tabler:heartbeat" sx={{ opacity: 0.65 }} />}
        sx={
          row.status === "resourceStopping" ||
          row.status === "resourceStarting" ||
          row.status === "resourceBeingCreated" ||
          row.status === "resourceBeingDeleted" ||
          row.status === "resourceRestarting"
            ? {
                animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
              }
            : null
        }
      >
        {sentenceCase(statusMessage)}
      </Label>
    );
  };

  const renderStatusCode = (row) => {
    if (!row.pingResult) return <></>;

    let codeType = parseInt(row.pingResult.toString().charAt(0));

    let color = "info";
    if (codeType === 2 || codeType === 3) {
      color = "success";
    } else if (codeType === 4 || codeType === 5) {
      color = "error";
    }

    return (
      <Label
        variant="ghost"
        color={color}
        style={{ fontFamily: "monospace" }}
        startIcon={
          <Iconify
            icon="mdi:transit-connection-variant"
            sx={{ opacity: 0.65 }}
          />
        }
      >
        {row.pingResult + " " + getReasonPhrase(row.pingResult)}
      </Label>
    );
  };

  const renderZone = (row) => {
    if (!row.zone || !zones) {
      return <></>;
    }

    const zone = zones.find(
      (zone) => zone.name === row.zone && zone.type === row.type
    );

    return (
      <Label
        variant="ghost"
        style={{ fontFamily: "monospace" }}
        startIcon={<Iconify icon="mdi:earth" sx={{ opacity: 0.65 }} />}
      >
        {zone?.description}
      </Label>
    );
  };

  const renderShared = (row) => {
    if (row?.teams?.length === 0) return <></>;

    return (
      <Label
        variant="ghost"
        style={{ fontFamily: "monospace" }}
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
      user.userData.find((d) => d.id === "onboarded")?.data !== "true"
    ) {
      // navigate("/onboarding");
      // Userdata broken for now
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {!initialLoad ? (
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
            >
              <Typography variant="h4">{t("menu-dashboard")}</Typography>

              <Button
                component={RouterLink}
                to="/create"
                startIcon={<Iconify icon={"mdi:plus"} />}
              >
                {t("menu-create-new")}
              </Button>
            </Stack>

            <JobList />

            <Card sx={{ boxShadow: 20 }}>
              <ListToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={handleFilterByName}
                loading={loading}
                selected={selected}
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
                                onChange={(event) => handleClick(event, row.id)}
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
