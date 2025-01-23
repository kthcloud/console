import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Job, Resource } from "../../types";
import { enqueueSnackbar } from "notistack";
import { updateDeployment } from "../../api/deploy/deployments";
import { updateVM } from "../../api/deploy/vms";
import useResource from "../../hooks/useResource";
import { errorHandler } from "../../utils/errorHandler";

export default function NeverStaleMode({ resource }: { resource: Resource }) {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const { queueJob, beginFastLoad } = useResource();

  const [neverStale, setNeverStale] = useState<boolean>(
    resource?.neverStale || false
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  useEffect(() => {
    if (!isUpdating) setNeverStale(resource?.neverStale || false);
  }, [resource, isUpdating]);

  const handleNeverStaleChange = async (neverStaleV: boolean) => {
    if (!(initialized && resource && keycloak.token)) {
      enqueueSnackbar(t("error-updating"), { variant: "error" });
      return;
    }

    try {
      let result: Job | null = null;
      if (resource.type === "deployment") {
        result = await updateDeployment(
          resource.id,
          { neverStale: neverStaleV },
          keycloak.token
        );
      } else if (resource.type === "vm") {
        result = await updateVM(keycloak.token, resource.id, {
          //@ts-ignore not added yet
          neverStale: neverStaleV,
        });
      }

      if (result) {
        queueJob(result);
        beginFastLoad();
        enqueueSnackbar(t("saving-never-stale"), { variant: "info" });
        setNeverStale(neverStaleV);
        setIsUpdating(true);
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-updating") + ": " + e, {
          variant: "error",
        })
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("never-stale-option-header")}
        subheader={t("never-stale-option-header-subheader")}
      />
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={neverStale}
              onChange={(e) => handleNeverStaleChange(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label={t("never-stale")}
        />
      </CardContent>
    </Card>
  );
}
