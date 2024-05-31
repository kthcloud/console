import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchUsers } from "../../api/deploy/users";
import { errorHandler } from "../../utils/errorHandler";
import { useKeycloak } from "@react-keycloak/web";
import ConfirmButton from "../../components/ConfirmButton";
import { Link } from "react-router-dom";
import useResource from "../../hooks/useResource";
import { updateTeam } from "../../api/deploy/teams";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Stack,
  Grid,
  Avatar,
} from "@mui/material";
import { Resource, User, Uuid } from "../../types";
import {
  ResourceMigrationCreate,
  TeamRead,
  UserReadDiscovery,
} from "@kthcloud/go-deploy-types/types/v2/body";
import Iconify from "../../components/Iconify";
import { createResourceMigration } from "../../api/deploy/resourceMigrations";

const DangerZone = ({ resource }: { resource: Resource }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { teams } = useResource();

  const [users, setUsers] = useState<UserReadDiscovery[]>([]);
  const [resultsUser, setResultsUser] = useState<UserReadDiscovery[]>([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [teamsList, setTeamsList] = useState<TeamRead[]>([]);
  const [resultsTeam, setResultsTeam] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [transferred, setTransferred] = useState(false);

  const userSearch = async (query: string) => {
    if (!(initialized && keycloak.token)) return;
    try {
      const response = await searchUsers(keycloak.token, query);
      let options: UserReadDiscovery[] = [];

      response.forEach((user: User) => {
        if (user.email) {
          user.username = user.email;
        }
        if (!users.find((u) => u.username === user.username)) {
          setUsers((users) => [...users, user]);
        }
        options.push(user);
      });

      options = [...new Set(options)];
      options.sort((a, b) => a.username.localeCompare(b.username));
      setResultsUser(options);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("search-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const teamSearch = async (query: string) => {
    if (!teams) return;

    let options: string[] = [];

    teams.forEach((team) => {
      if (!teamsList.find((t) => t.name === team.name)) {
        setTeamsList((teamsList) => [...teamsList, team]);
      }
      options.push(team.name);
    });

    options = [...new Set(options)];
    options.sort((a, b) => a.localeCompare(b));
    options = options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase())
    );
    setResultsTeam(options);
  };

  const updateOwner = async () => {
    if (!(initialized && keycloak.token)) return;

    // find owner id of selected user
    const selected = users.find(
      (user) => user.email === selectedUser || user.username === selectedUser
    );
    if (!selected) return;
    const ownerId = selected.id;

    // update resource with body containing new owner id
    const body: ResourceMigrationCreate = {
      type: "updateOwner",
      resourceId: resource.id,
      updateOwner: {
        ownerId: ownerId,
      },
    };

    try {
      let response;
      response = await createResourceMigration(keycloak.token, body);
      if (response) {
        setTransferred(true);
        enqueueSnackbar(t("successfully-transferred"), {
          variant: "success",
        });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const addToTeam = async () => {
    if (!(initialized && keycloak.token)) return;

    // find team id of selected team
    const selected = teams.find(
      (team) => team.name === selectedTeam || team.id === selectedTeam
    );

    if (!selected) return;

    let currentIds: Uuid[] = [];
    if (selected.resources) {
      selected.resources.forEach((r) => {
        currentIds.push(r.id);
      });
    }

    if (currentIds.includes(resource.id)) {
      currentIds = currentIds.filter((id) => id !== resource.id);
    }

    const body = {
      resources: [...currentIds, resource.id],
    };

    try {
      const response = await updateTeam(keycloak.token, selected.id, body);

      if (response) {
        enqueueSnackbar(t("successfully-added-to-team"), {
          variant: "success",
        });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  useEffect(() => {
    teamSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card
      sx={{
        boxShadow: 20,
        border: 1,
        borderRadius: 1,
        borderColor: "#ff534c",
      }}
    >
      <CardHeader title={t("danger-zone")} />
      <CardContent>
        {transferred ? (
          <>
            <Typography gutterBottom>
              {t("successfully-transferred")}
            </Typography>
            <Button component={Link} to="/deploy" variant="contained">
              {t("back-to-dashboard")}
            </Button>
          </>
        ) : (
          <Stack direction="column" useFlexGap spacing={5}>
            <Stack
              direction="column"
              useFlexGap
              spacing={1}
              alignItems={"flex-start"}
            >
              <Typography gutterBottom>
                {t("share-with-team-description")}
              </Typography>
              <Autocomplete
                disableClearable
                options={resultsTeam}
                inputValue={selectedTeam}
                onInputChange={(_, value) => {
                  setSelectedTeam(value);
                  teamSearch(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("search-for-teams")}
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                    sx={{ minWidth: 300 }}
                    variant="outlined"
                  />
                )}
              />
              <ConfirmButton
                action={t("share-with-team-action")}
                actionText={`${t("share")} ${resource.name} ${t(
                  "with"
                )} ${selectedTeam}`}
                callback={addToTeam}
                props={{
                  sx: { marginTop: 2 },
                  variant: "contained",
                  color: "error",
                }}
              />
            </Stack>
            <Stack
              direction="column"
              useFlexGap
              spacing={1}
              alignItems={"flex-start"}
            >
              <Typography gutterBottom>{t("transfer-ownership")}</Typography>
              <Autocomplete
                disableClearable
                options={resultsUser}
                inputValue={selectedUser}
                onInputChange={(_, value) => {
                  setSelectedUser(value);
                  userSearch(value);
                }}
                getOptionLabel={(option) => {
                  return option.username;
                }}
                isOptionEqualToValue={(option, value) => {
                  return option.id === value.id;
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      <Grid container alignItems="center">
                        <Grid item sx={{ display: "flex", width: 44 }}>
                          {option.gravatarUrl ? (
                            <Avatar
                              src={option.gravatarUrl + "?s=32"}
                              sx={{ width: 20, height: 20 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 20, height: 20 }}>
                              <Iconify
                                icon="mdi:account"
                                sx={{ width: 16, height: 16 }}
                                title="Profile"
                              />
                            </Avatar>
                          )}
                          <Grid
                            item
                            sx={{
                              width: "calc(100% - 44px)",
                              wordWrap: "break-word",
                              paddingLeft: 1,
                            }}
                          ></Grid>
                          <Typography variant="body2" color="text.secondary">
                            {option.username}
                          </Typography>
                        </Grid>
                      </Grid>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("search-for-users")}
                    InputProps={{
                      ...params.InputProps,
                      type: "search",
                    }}
                    sx={{ minWidth: 300 }}
                    variant="outlined"
                  />
                )}
              />
              <ConfirmButton
                action={t("transfer-ownership-action")}
                actionText={`${t("transfer")} ${resource.name} ${t(
                  "to-user"
                )} ${selectedUser}`}
                callback={updateOwner}
                props={{
                  sx: { marginTop: 2 },
                  variant: "contained",
                  color: "error",
                }}
              />
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default DangerZone;
