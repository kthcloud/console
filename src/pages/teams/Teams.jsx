import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { sentenceCase } from "change-case";
import { enqueueSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addMembers,
  createTeam,
  deleteTeam,
  updateTeam,
} from "src/api/deploy/teams";
import { searchUsers } from "src/api/deploy/users";
import ConfirmButton from "src/components/ConfirmButton";
import Gravatar from "src/components/Gravatar";
import Iconify from "src/components/Iconify";
import JobList from "src/components/JobList";
import LoadingPage from "src/components/LoadingPage";
import Page from "src/components/Page";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

const Teams = () => {
  const { user, teams } = useResource();
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();

  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setStale(null);
  }, [teams]);

  const create = async () => {
    if (!initialized) return;
    setLoading(true);

    try {
      await createTeam(keycloak.token, teamName, teamDescription);
      setTeamName("");
      setTeamDescription("");
      setStale("created");
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (team) => {
    if (!initialized) return;

    setStale("delete " + team.id);
    try {
      await deleteTeam(keycloak.token, team.id);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const search = async (query) => {
    if (!initialized) return;
    try {
      let response = await searchUsers(keycloak.token, query);
      let options = [];

      response.forEach((user) => {
        if (user.email) {
          user.username = user.email;
        }
        if (!users.find((u) => u.username === user.username)) {
          setUsers((users) => [...users, user]);
        }
        options.push(user.username);
      });

      options = [...new Set(options)];
      options.sort((a, b) => a.localeCompare(b));
      setResults(options);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("search-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const invite = async (team) => {
    if (!initialized) return;

    let member = users.find(
      (user) => user.email === selected || user.username === selected
    );

    try {
      await addMembers(keycloak.token, team.id, [...team.members, member]);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const handleRemoveResource = async (team, resource) => {
    if (!initialized) return;

    let currentIds = team.resources
      .map((r) => r.id)
      .filter((id) => id !== resource.id);

    let body = {
      resources: currentIds,
    };

    try {
      await updateTeam(keycloak.token, team.id, body);
      setStale("removeResource " + resource.id + team.id);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const handleRemoveUser = async (team, user) => {
    if (!initialized) return;

    let body = {
      members: team.members.filter((member) => member.id !== user.id),
    };

    try {
      await updateTeam(keycloak.token, team.id, body);
      setStale("removeUser " + user.id + team.id);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title={t("teams")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("teams")}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={t("current-teams")}
                  subheader={
                    <>
                      {t("teams-subheader-1")}
                      <br />
                      {t("teams-subheader-2")}
                    </>
                  }
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableBody>
                        {teams.map((team, index) =>
                          stale !== "delete " + team.id ? (
                            <Fragment key={team.id + "08ysedfioshu"}>
                              <TableRow
                                key={"teamrow" + team.id}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                  cursor: "pointer",
                                  background:
                                    expandedTeam === team.id
                                      ? "#f9fafb"
                                      : "white",
                                }}
                                onClick={() =>
                                  expandedTeam === team.id
                                    ? setExpandedTeam(null)
                                    : setExpandedTeam(team.id)
                                }
                              >
                                <TableCell component="th" scope="row">
                                  <Stack direction="column" spacing={1}>
                                    <Typography variant="body1">
                                      {team.name}
                                    </Typography>
                                    <Typography variant="caption">
                                      {team.description}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems={"center"}
                                    useFlexGap
                                  >
                                    <AvatarGroup max={4}>
                                      {team.members.map((member) => (
                                        <Gravatar
                                          user={member}
                                          alt={member.username}
                                          sx={{ width: 24, height: 24 }}
                                          key={"avatar" + member.id}
                                        />
                                      ))}
                                      {team.members.length === 0 && (
                                        <Tooltip title={"Boo!"}>
                                          <Avatar
                                            sx={{ width: 24, height: 24 }}
                                          >
                                            <Iconify icon="mdi:ghost" />
                                          </Avatar>
                                        </Tooltip>
                                      )}
                                    </AvatarGroup>
                                    {`${team.members.length} ${t("members")}`}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems={"center"}
                                    useFlexGap
                                  >
                                    <Iconify icon="mdi:account-group" />
                                    {team.resources &&
                                      team.resources.length +
                                        " " +
                                        (team.resources.length > 1 ||
                                        team.resources.length === 0
                                          ? t("resources")
                                          : t("resource"))}
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">
                                  <Iconify
                                    icon={
                                      expandedTeam === team.id
                                        ? "mdi:expand-less"
                                        : "mdi:expand-more"
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                              {expandedTeam === team.id && (
                                <TableRow
                                  key={"teamrow" + team.id + "expanded"}
                                >
                                  <TableCell colSpan={3}>
                                    <Stack direction="column" spacing={1}>
                                      <TableContainer>
                                        <Table>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell colSpan={5}>
                                                {t("members")}
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {team.members.map((member) => (
                                              <TableRow
                                                key={
                                                  team.id +
                                                  " " +
                                                  member.username
                                                }
                                              >
                                                {stale ===
                                                "removeUser " +
                                                  member.id +
                                                  team.id ? (
                                                  <TableCell colSpan={5}>
                                                    <Skeleton
                                                      animation="wave"
                                                      height={64}
                                                    />
                                                  </TableCell>
                                                ) : (
                                                  <>
                                                    <TableCell>
                                                      {member.email ||
                                                        member.username}
                                                    </TableCell>
                                                    <TableCell>
                                                      {sentenceCase(
                                                        member.teamRole
                                                      )}
                                                    </TableCell>
                                                    <TableCell>
                                                      {sentenceCase(
                                                        member.memberStatus
                                                      )}
                                                    </TableCell>
                                                    <TableCell
                                                      sx={{
                                                        color: "text.secondary",
                                                      }}
                                                    >
                                                      {
                                                        member?.addedAt
                                                          ?.replace("T", " ")
                                                          ?.split(".")[0]
                                                      }
                                                    </TableCell>
                                                    <TableCell align="right">
                                                      <ConfirmButton
                                                        action={t("remove")}
                                                        actionText={
                                                          t(
                                                            "remove"
                                                          ).toLowerCase() +
                                                          " " +
                                                          (member.email ||
                                                            member.username) +
                                                          " " +
                                                          t("from-team")
                                                        }
                                                        callback={() =>
                                                          handleRemoveUser(
                                                            team,
                                                            member
                                                          )
                                                        }
                                                        props={{
                                                          color: "error",
                                                          startIcon: (
                                                            <Iconify icon="mdi:account-multiple-remove" />
                                                          ),
                                                        }}
                                                      />
                                                    </TableCell>
                                                  </>
                                                )}
                                              </TableRow>
                                            ))}

                                            <TableRow>
                                              <TableCell colSpan={5}>
                                                <Stack
                                                  direction="row"
                                                  spacing={3}
                                                  alignItems={"center"}
                                                  justifyContent={
                                                    "space-between"
                                                  }
                                                  useFlexGap
                                                  pt={1}
                                                  pb={2}
                                                >
                                                  <Autocomplete
                                                    disableClearable
                                                    options={results}
                                                    inputValue={selected}
                                                    sx={{ minWidth: 300 }}
                                                    onInputChange={(
                                                      _,
                                                      value
                                                    ) => {
                                                      setSelected(value);
                                                      search(value);
                                                    }}
                                                    renderInput={(params) => (
                                                      <TextField
                                                        {...params}
                                                        label={t(
                                                          "search-for-users"
                                                        )}
                                                        InputProps={{
                                                          ...params.InputProps,
                                                          type: "search",
                                                        }}
                                                        variant="standard"
                                                      />
                                                    )}
                                                  />
                                                  <Button
                                                    onClick={() => invite(team)}
                                                    variant="contained"
                                                    startIcon={
                                                      <Iconify icon="mdi:invite" />
                                                    }
                                                  >
                                                    {t("invite")}
                                                  </Button>
                                                  <Box sx={{ flexGrow: 1 }} />
                                                  <ConfirmButton
                                                    action={t("delete")}
                                                    actionText={
                                                      t("delete") +
                                                      " " +
                                                      team.name
                                                    }
                                                    callback={() =>
                                                      handleDelete(team)
                                                    }
                                                    props={{
                                                      color: "error",
                                                      startIcon: (
                                                        <Iconify icon="mdi:delete" />
                                                      ),
                                                    }}
                                                  />
                                                </Stack>
                                              </TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                      {team.resources &&
                                        team.resources.length > 0 && (
                                          <TableContainer>
                                            <Table>
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell colSpan={3}>
                                                    {t("resources")}
                                                  </TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {team.resources.map((r) => (
                                                  <TableRow
                                                    key={r.id + team.id}
                                                  >
                                                    {stale ===
                                                    "removeResource " +
                                                      r.id +
                                                      team.id ? (
                                                      <TableCell colSpan={3}>
                                                        <Skeleton
                                                          animation="wave"
                                                          height={64}
                                                        />
                                                      </TableCell>
                                                    ) : (
                                                      <>
                                                        <TableCell>
                                                          {r.name}
                                                        </TableCell>
                                                        <TableCell>
                                                          {r.type}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                          <ConfirmButton
                                                            action={t("remove")}
                                                            actionText={
                                                              t(
                                                                "remove"
                                                              ).toLowerCase() +
                                                              " " +
                                                              r.name +
                                                              " " +
                                                              t(
                                                                "from-team"
                                                              ).toLowerCase()
                                                            }
                                                            callback={() =>
                                                              handleRemoveResource(
                                                                team,
                                                                r
                                                              )
                                                            }
                                                            props={{
                                                              color: "error",
                                                              startIcon: (
                                                                <Iconify icon="mdi:account-multiple-remove" />
                                                              ),
                                                            }}
                                                          />
                                                        </TableCell>
                                                      </>
                                                    )}
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <Skeleton animation="wave" height={64} />
                              </TableCell>
                            </TableRow>
                          )
                        )}

                        {stale === "created" && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Skeleton animation="wave" height={64} />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("create-team")} />
                <CardContent>
                  <Stack
                    spacing={2}
                    direction={"column"}
                    alignItems={"flex-start"}
                  >
                    <TextField
                      label={t("admin-name")}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      fullWidth
                      disabled={loading}
                    />
                    <TextField
                      label={t("description")}
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      fullWidth
                      disabled={loading}
                    />
                    <Button
                      variant="contained"
                      onClick={create}
                      disabled={loading}
                    >
                      {t("create-and-go")}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};

export default Teams;
