import {
  Autocomplete,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addMembers, createTeam, deleteTeam } from "src/api/deploy/teams";
import { searchUsers } from "src/api/deploy/users";
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
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState("");
  const [users, setUsers] = useState([]);

  const create = async () => {
    if (!initialized) return;
    setLoading(true);

    try {
      await createTeam(keycloak.token, teamName, teamDescription);
      setTeamName("");
      setTeamDescription("");
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
                  subheader={t("teams-subheader")}
                />
                <CardContent>
                  <Stack spacing={2} direction={"column"}>
                    {teams.map((team) => (
                      <Stack
                        key={team.id}
                        direction="row"
                        spacing={2}
                        justifyContent={"space-between"}
                        useFlexGap
                        alignItems={"flex-start"}
                        flexWrap={"wrap"}
                      >
                        <Stack
                          direction="column"
                          spacing={2}
                          alignItems={"flex-start"}
                        >
                          <Divider sx={{ borderStyle: "dashed" }} />
                          <Typography variant="h6">{team.name}</Typography>
                          {team.members.map((member) => (
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems={"center"}
                              useFlexGap
                            >
                              <Typography variant="body1">
                                {member.email || member.username}
                              </Typography>
                              <Typography variant="caption">
                                {member.teamRole}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {
                                  member?.addedAt
                                    ?.replace("T", " ")
                                    ?.split(".")[0]
                                }
                              </Typography>
                            </Stack>
                          ))}

                          {expandedTeam === team.id && (
                            <>
                              <Autocomplete
                                disableClearable
                                options={results}
                                inputValue={selected}
                                fullWidth
                                sx={{minWidth: 300}}
                                onInputChange={(_, value) => {
                                  setSelected(value);
                                  search(value);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={t("search-for-users")}
                                    InputProps={{
                                      ...params.InputProps,
                                      type: "search",
                                    }}
                                  />
                                )}
                              />
                              <Button onClick={() => invite(team)}>
                                {t("invite")}
                              </Button>
                            </>
                          )}
                        </Stack>
                        <ButtonGroup>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              expandedTeam !== team.id
                                ? setExpandedTeam(team.id)
                                : setExpandedTeam(null)
                            }
                            startIcon={
                              expandedTeam === team.id ? (
                                <Iconify icon="mdi:minus" />
                              ) : (
                                <Iconify icon="mdi:plus" />
                              )
                            }
                          >
                            {expandedTeam === team.id
                              ? t("button-close")
                              : t("invite")}
                          </Button>

                          <Button
                            variant="outlined"
                            onClick={() => handleDelete(team)}
                            color="error"
                            startIcon={<Iconify icon="mdi:delete" />}
                          >
                            {t("button-delete")}
                          </Button>
                        </ButtonGroup>
                      </Stack>
                    ))}
                  </Stack>
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
