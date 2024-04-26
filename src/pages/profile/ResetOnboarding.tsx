import { LoadingButton } from "@mui/lab";
import { Card, CardActions, CardHeader, CircularProgress } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useResource from "../../hooks/useResource";
import { updateUserData } from "../../api/deploy/userData";
import { UserDataRead } from "go-deploy-types/types/v1/body";

export const ResetOnboarding = () => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const { initialLoad } = useResource();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const reset = async () => {
    if (!(initialized && keycloak.token)) return;

    setLoading(true);

    const response: UserDataRead = await updateUserData(
      keycloak.token,
      "onboarded",
      "false"
    );
    if (response) {
      setTimeout(() => {
        navigate("/onboarding");
      }, 500);
    }
  };

  return (
    <>
      {!initialLoad ? (
        <CircularProgress />
      ) : (
        <Card sx={{ boxShadow: 20 }}>
          <CardHeader
            title={t("view-onboarding")}
            subheader={t("view-onboarding-subheader")}
          />
          <CardActions>
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={reset}
              sx={{ margin: 2 }}
            >
              {t("reset-onboarding")}
            </LoadingButton>
          </CardActions>
        </Card>
      )}
    </>
  );
};
