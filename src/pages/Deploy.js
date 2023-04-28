import { filter } from "lodash";
import { sentenceCase } from "change-case";
import useInterval from "../utils/useInterval";
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import LoadingPage from "../components/LoadingPage";

// material
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
  Alert,
  Link,
} from "@mui/material";

// hooks
import useAlert from "src/hooks/useAlert";

// components
import Page from "../components/Page";
import Label from "../components/Label";
import Scrollbar from "../components/Scrollbar";
import SearchNotFound from "../sections/deploy/SearchNotFound";
import { ListHead, ListToolbar, MoreMenu } from "../sections/deploy";
import CreateDeployment from "src/sections/deploy/CreateDeployment";
import CreateVm from "src/sections/deploy/CreateVm";
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "type", label: "Instance type", alignRight: false },
  { id: "status", label: "Status", alignRight: false },
  { id: "" },
];

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

export default function Deploy() {
  const [order, setOrder] = useState("asc");

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState("name");

  const [filterName, setFilterName] = useState("");

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);

  const [initialLoad, setInitialLoad] = useState(false);

  const { keycloak, initialized } = useKeycloak();

  const { setAlert } = useAlert();

  const createDeployment = async (name) => {
    if (!initialized) return;

    const body = {
      name: name,
    };

    return fetch(process.env.REACT_APP_DEPLOY_API_URL + "/deployments", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + keycloak.token,
      },
      body: JSON.stringify(body),
    }).then(async (result) => {
      const jsonResult = await result.json();
      if (result.ok) {
        return jsonResult;
      }
      throw jsonResult;
    });
  };

  const createVm = async (name) => {
    if (!initialized) return;

    const body = {
      name: name,
    };

    return await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + keycloak.token,
      },
      body: JSON.stringify(body),
    }).then(async (result) => {
      const jsonResult = await result.json();
      if (result.ok) {
        return jsonResult;
      }
      throw jsonResult;
    });
  };

  const getVMs = async () => {
    if (!initialized) return -1;

    try {
      const res = await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + keycloak.token,
        },
      });
      const response = await res.json();
      const result = response.map((obj) => ({ ...obj, type: "vm" }));
      if (Array.isArray(result)) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching VMs:", error);
    }
  };

  const getDeployments = async () => {
    if (!initialized) return -1;

    try {
      const res = await fetch(
        process.env.REACT_APP_DEPLOY_API_URL + "/deployments",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + keycloak.token,
          },
        }
      );
      const response = await res.json();
      const result = response.map((obj) => ({ ...obj, type: "deployment" }));
      if (Array.isArray(result)) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    }
  };

  const mergeLists = (resources) => {
    let array = resources[0].concat(resources[1]);
    array = applySortFilter(array, getComparator(order, orderBy), filterName);
    setRows(array);
  };

  const loadResources = async () => {
    setLoading(true);
    const promises =  [getVMs(), getDeployments()];

    mergeLists(await Promise.all(promises));

    setInitialLoad(true);
    setLoading(false);
  };

  // Run once on load
  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run every second
  useInterval(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 5000);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
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

  const noResultsFound = rows.length === 0;

  return (
    <>
      {" "}
      {!initialLoad ? (
        <LoadingPage />
      ) : (
        <Page title="Deploy">
          <Container>
            <Alert severity="warning" sx={{ mb: 5 }} elevation={3}>
              PaaS deployment is still in development, features may or may not
              work
            </Alert>

            <Stack
              sx={{
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-begin", md: "center" },
              }}
              alignItems="center"
              justifyContent="space-between"
              mb={5}
            >
              <Typography variant="h4" gutterBottom>
                Deploy
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  justifyContent: { xs: "space-between", md: "space-around" },
                }}
                mb={5}
              >
                <CreateVm
                  onCreate={(name) => {
                    return createVm(name)
                      .then(({ id }) => {
                        setAlert("Sucessfully created VM " + id, "success");
                      })
                      .catch((err) => {
                        if (err.status === 400) {
                          setAlert(
                            "Failed to create VM. Invalid input: " +
                              JSON.stringify(err),
                            "error"
                          );
                        } else if (Array.isArray(err.errors)) {
                          err.errors.forEach((error) => {
                            setAlert(error.msg, "error");
                          });
                        } else {
                          setAlert(
                            "Failed to create vm. Details: " +
                              JSON.stringify(err),
                            "error"
                          );
                        }
                      });
                  }}
                />

                <CreateDeployment
                  onCreate={(name) => {
                    return createDeployment(name)
                      .then(({ id }) => {
                        setAlert(
                          "Sucessfully created deployment " + id,
                          "success"
                        );
                      })
                      .catch((err) => {
                        if (err.status === 400) {
                          setAlert(
                            "Failed to create deployment. Invalid input: " +
                              err,
                            "error"
                          );
                        } else {
                          setAlert(
                            "Failed to create deployment. Details: " + err,
                            "error"
                          );
                        }
                      });
                  }}
                />
              </Stack>
            </Stack>

            <Card>
              <ListToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={handleFilterByName}
                loading={loading}
              />

              <Scrollbar>
                <TableContainer sx={{ minWidth: 600 }}>
                  <Table>
                    <ListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={rows.length}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllClick={handleSelectAllClick}
                    />
                    <TableBody>
                      {rows.map((row) => {
                        const { id, name, type, status } = row;
                        const isItemSelected = selected.indexOf(name) !== -1;

                        return (
                          <TableRow
                            hover
                            key={id}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, name)}
                              />
                            </TableCell>
                            <TableCell align="left">
                              {type === "deployment" &&
                              row.url !== "https://notset" ? (
                                <Link
                                  href={row.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  underline="none"
                                >
                                  {name}
                                </Link>
                              ) : (
                                name
                              )}
                            </TableCell>
                            <TableCell align="left">{type}</TableCell>
                            <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={
                                  (status === "resourceError" && "error") ||
                                  (status === "resourceUnknown" && "error") ||
                                  (status === "resourceStopped" && "warning") ||
                                  (status === "resourceBeingCreated" &&
                                    "info") ||
                                  (status === "resourceBeingDeleted" &&
                                    "info") ||
                                  (status === "resourceBeingDeleted" &&
                                    "info") ||
                                  (status === "resourceStarting" && "info") ||
                                  (status === "resourceStopping" && "info") ||
                                  (status === "resourceRunning" && "success")
                                }
                              >
                                {sentenceCase(status)}
                              </Label>
                            </TableCell>

                            <TableCell align="right">
                              <MoreMenu row={row} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>

                    {noResultsFound && (
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
