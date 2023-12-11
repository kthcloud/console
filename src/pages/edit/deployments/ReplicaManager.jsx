import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Slider,
  Stack,
  Typography,
} from "@mui/material";

import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "src/hooks/useResource";
import { updateDeployment } from "src/api/deploy/deployments";
import { errorHandler } from "src/utils/errorHandler";
import { useTranslation } from "react-i18next";

export const ReplicaManager = ({ deployment }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { queueJob, user } = useResource();

  const [loading, setLoading] = useState(false);
  const [max, setMax] = useState(0);
  const [count, _setCount] = useState(deployment.replicas);

  useEffect(() => {
    if (!(initialized && user)) return;
    if (user.admin) {
      setMax(100);
      return;
    }

    setMax(user.quota.deployments - user.usage.deployments);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyChanges = async (r) => {
    if (!initialized) return;
    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { replicas: r },
        keycloak.token
      );

      queueJob(res);
      enqueueSnackbar(t("replicas-saving"), { variant: "info" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-save-replicas") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const setCount = (v) => {
    navigator?.vibrate([0.1, 5, 0.1]);

    if (v > max) {
      enqueueSnackbar(t("max-replicas") + max, { variant: "warning" });
      return;
    }

    _setCount(v);
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={t("replicas")} subheader={t("replicas-subheader")} />

      <CardContent>
        <Typography gutterBottom variant="body2">
          {t("replicas-shutdown")}
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              aria-labelledby="input-slider"
              value={count}
              onChange={(e, v) => setCount(v)}
              min={0}
              max={max}
              step={1}
              marks
              aria-label={t("replicas")}
              valueLabelDisplay="auto"
              disabled={loading}
            />
          </Grid>
          <Grid item>
            <Typography gutterBottom style={{ fontFamily: "monospace" }}>
              <span style={{ opacity: 0 }}>{count < 10 ? "0" : ""}</span>
              {count}/{max}
            </Typography>
          </Grid>
        </Grid>

        {count === 0 && (
          <Typography gutterBottom variant="body2">
            {t("replicas-shutdown-warning")}
          </Typography>
        )}

        {count !== deployment.replicas && (
          <Stack direction="row" spacing={2} alignItems="center" useFlexGap>
            <Button
              variant="contained"
              color="primary"
              onClick={() => applyChanges(count)}
              disabled={loading}
            >
              {t("apply")}
            </Button>

            <Button
              onClick={() => setCount(deployment.replicas)}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
