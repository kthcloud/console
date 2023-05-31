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
import useResource from "src/hooks/useResource";
import { updateDeployment } from "src/api/deploy/deployments";

export const PrivateMode = ({ deployment }) => {
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
      enqueueSnackbar("Visibility saving...", { variant: "success" });
    } catch (e) {
      console.error("Failed to update deployment private mode:");
      console.error(e);
      enqueueSnackbar("Failed to update visibility", { variant: "error" });
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
        title={"Visibility"}
        subheader={
          "Choose whether to make this deployment hidden from the internet"
        }
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
                label="Private"
                labelPlacement="end"
                sx={{ ml: 1 }}
              />
            }
            label="Public"
            labelPlacement="start"
          />
        )}
      </CardContent>
    </Card>
  );
};
