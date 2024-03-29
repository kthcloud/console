import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchUsers } from "/src/api/deploy/users";
import { errorHandler } from "/src/utils/errorHandler";
import { useKeycloak } from "@react-keycloak/web";
import ConfirmButton from "/src/components/ConfirmButton";
import { updateVM } from "/src/api/deploy/vms";
import { Link } from "react-router-dom";
import { updateDeployment } from "/src/api/deploy/deployments";
import useResource from "/src/hooks/useResource";
import { updateTeam } from "/src/api/deploy/teams";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Stack,
} from "@mui/material";

const DangerZone = ({ resource }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { teams } = useResource();

  const [users, setUsers] = useState([]);
  const [resultsUser, setResultsUser] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [teamsList, setTeamsList] = useState([]);
  const [resultsTeam, setResultsTeam] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [transferred, setTransferred] = useState(false);

  const userSearch = async (query) => {
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
      setResultsUser(options);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("search-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const teamSearch = async (query) => {
    if (!teams) return;

    let options = [];

    teams.forEach((team) => {
      if (!teamsList.find((t) => t.name === team.name)) {
        setTeamsList((teamsList) => [...teamsList, team]);
      }
      options.push(team.name);
    });

    options = [...new Set(options)];
    options.sort((a, b) => a.localeCompare(b));
    setResultsTeam(options);
  };

  const updateOwner = async () => {
    if (!initialized) return;

    // find owner id of selected user
    const selected = users.find(
      (user) => user.email === selectedUser || user.username === selectedUser
    );
    if (!selected) return;
    const ownerId = selected.id;

    // update resource with body containing new owner id
    const body = {
      ownerId: ownerId,
    };
    try {
      let response;
      if (resource.type === "vm") {
        response = await updateVM(resource.id, body, keycloak.token);
      } else if (resource.type === "deployment") {
        response = await updateDeployment(resource.id, body, keycloak.token);
      }

      if (response) {
        setTransferred(true);
        enqueueSnackbar(t("successfully-transferred"), {
          variant: "success",
        });
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const addToTeam = async () => {
    if (!initialized) return;

    // find team id of selected team
    const selected = teams.find(
      (team) => team.name === selectedTeam || team.id === selectedTeam
    );

    let currentIds = [];
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
      let response = await updateTeam(keycloak.token, selected.id, body);

      if (response) {
        enqueueSnackbar(t("successfully-added-to-team"), {
          variant: "success",
        });
      }
    } catch (error) {
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
