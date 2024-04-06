import {
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";

import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "../../../hooks/useResource";
import { updateDeployment } from "../../../api/deploy/deployments";
import { errorHandler } from "../../../utils/errorHandler";
import { useTranslation } from "react-i18next";

export const PrivateMode = ({ deployment }) => {
  const { t } = useTranslation();
  const [privateMode, setPrivateMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const applyChanges = async (checked) => {
    if (!initialized) return;
    setPrivateMode(checked);
    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { private: checked },
        keycloak.token
      );

      queueJob(res);
      enqueueSnackbar(t("visibility-saving"), { variant: "info" });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-save-visibility") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPrivateMode(deployment.private);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for changes in upstream deployment object
  useEffect(() => {
    if (privateMode === null) {
      setPrivateMode(deployment.private);
      return;
    }

    if (loading) {
      return;
    }

    setPrivateMode(deployment.private);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment]);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("admin-visibility")}
        subheader={t("visibility-subheader")}
      />

      <CardContent>
        {privateMode == null || loading ? (
          <CircularProgress />
        ) : (
          <FormControlLabel
            control={
              <FormControlLabel
                control={
                  <Switch
                    checked={privateMode}
                    onChange={(e) => applyChanges(e.target.checked)}
                  />
                }
                label={t("admin-visibility-private")}
                labelPlacement="end"
                sx={{ ml: 1 }}
              />
            }
            label={t("admin-visibility-public")}
            labelPlacement="start"
          />
        )}
      </CardContent>
    </Card>
  );
};
