import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateDeployment } from "../../../api/deploy/deployments";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";

import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  CardActions,
  Button,
  Tooltip,
  TextField,
} from "@mui/material";

export const HealthCheckRoute = ({ deployment }) => {
  const [editing, setEditing] = useState(false);
  const { keycloak } = useKeycloak();
  const [newPath, setNewPath] = useState(deployment.healthCheckPath);
  const { queueJob } = useResource();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const save = async () => {
    let newRoute = newPath.trim();
    if (!newRoute.startsWith("/")) newRoute = "/" + newRoute;

    if (newRoute === deployment.healthCheckPath) {
      setEditing(false);
      return;
    }

    try {
      const res = await updateDeployment(
        deployment.id,
        { healthCheckPath: newPath },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-route-update"), {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-save-route") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("health-check")}
        subheader={t("health-check-subheader")}
        action={
          <Tooltip
            enterTouchDelay={10}
            title={editing ? t("cancel") : t("button-edit")}
          >
            <IconButton
              onClick={() => {
                setNewPath(deployment.healthCheckPath);
                setEditing(!editing);
              }}
              color={editing ? "default" : "primary"}
            >
              {editing ? (
                <Iconify icon="material-symbols:close" />
              ) : (
                <Iconify icon="mdi:pencil" />
              )}
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {editing ? (
          <TextField
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            autoFocus
            fullWidth
            variant="outlined"
            label={t("health-check-path")}
            disabled={loading}
            placeholder={deployment.healthCheckPath}
          />
        ) : (
          <pre>{deployment.healthCheckPath}</pre>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "end" }}>
        {editing && (
          <Button
            onClick={save}
            variant="contained"
            startIcon={<Iconify icon="material-symbols:save" />}
          >
            {t("button-save")}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
