import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";

import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "../../../hooks/useResource";
import { updateDeployment } from "../../../api/deploy/deployments";
import { errorHandler } from "../../../utils/errorHandler";
import { useTranslation } from "react-i18next";
import { Deployment } from "../../../types";

type visibility = "public" | "private" | "auth" | string;

const PrivacyModeSelector = ({
  privacyMode,
  setPrivacyMode,
  applyChanges,
}: {
  privacyMode: visibility | null;
  setPrivacyMode: Dispatch<SetStateAction<visibility | null>>;
  applyChanges: (checked: visibility) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: visibility
  ) => {
    setPrivacyMode(value);
    applyChanges(value);
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={privacyMode}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
    >
      <Tooltip enterTouchDelay={10} title={t("visibility-public-tooltip")}>
        <ToggleButton value="public">
          {t("admin-visibility-public")}
        </ToggleButton>
      </Tooltip>
      <Tooltip enterTouchDelay={10} title={t("visibility-auth-tooltip")}>
        <ToggleButton value="auth">
          <>{t("admin-visibility-auth")}</>
        </ToggleButton>
      </Tooltip>
      <Tooltip enterTouchDelay={10} title={t("visibility-private-tooltip")}>
        <ToggleButton value="private">
          {t("admin-visibility-private")}
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

export const PrivateMode = ({ deployment }: { deployment: Deployment }) => {
  const { t } = useTranslation();
  const [privateMode, setPrivacyMode] = useState<visibility | null>(null);
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  const applyChanges = async (visibility: visibility) => {
    if (!(initialized && keycloak.token)) return;
    setPrivacyMode(visibility);
    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { Visibility: visibility },
        keycloak.token
      );

      queueJob(res);
      enqueueSnackbar(t("visibility-saving"), { variant: "info" });
    } catch (error: any) {
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
    setPrivacyMode(deployment.visibility);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for changes in upstream deployment object
  useEffect(() => {
    if (privateMode === null) {
      setPrivacyMode(deployment.visibility);
      return;
    }

    if (loading) {
      return;
    }

    setPrivacyMode(deployment.visibility);

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
          <PrivacyModeSelector
            privacyMode={privateMode}
            setPrivacyMode={setPrivacyMode}
            applyChanges={applyChanges}
          />
        )}
      </CardContent>
    </Card>
  );
};
