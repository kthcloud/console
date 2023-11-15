import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { searchUsers } from "src/api/deploy/users";
import { errorHandler } from "src/utils/errorHandler";
import { useKeycloak } from "@react-keycloak/web";
import ConfirmButton from "src/components/ConfirmButton";
import { updateVM } from "src/api/deploy/vms";
import { Link } from "react-router-dom";
import { updateDeployment } from "src/api/deploy/deployments";
const {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Button,
} = require("@mui/material");

const DangerZone = ({resource}) => {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const { initialized, keycloak } = useKeycloak();
  const [selected, setSelected] = useState('');
  const [success, setSuccess] = useState(false);

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

  const updateOwner = async () => {
    if (!initialized) return;

    // find owner id of selected user
    const selectedUser = users.find(
      (user) => user.email === selected || user.username === selected
    );
    if (!selectedUser) return;
    const ownerId = selectedUser.id;

    // update resource with body containing new owner id
    const body = {
      ownerId: ownerId,
    };
    try {
      let response;
      if (resource.type === "vm") {
        response = await updateVM(resource.id, body, keycloak.token);
      }
      else if (resource.type === "deployment") {
        response = await updateDeployment(resource.id, body, keycloak.token);
      }


      if (response) {
        setSuccess(true);
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

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
        {success ? (
          <>
            <Typography gutterBottom>{t("successfully-transferred")}</Typography>
            <Button component={Link} to="/" variant="contained">
            {t("back-to-dashboard")}
            </Button>
          </>
        ) : (
          <>
            <Typography gutterBottom>{t("transfer-ownership")}</Typography>
            <Autocomplete
              disableClearable
              options={results}
              inputValue={selected}
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
            <ConfirmButton
              action={t("transfer-ownership-action")}
              actionText={`${t("transfer")} ${resource.name} ${t("to-user")} ${selected}`}
              callback={updateOwner}
              props={{
                sx: { marginTop: 2 },
                variant: "contained",
                color: "error",
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DangerZone;
