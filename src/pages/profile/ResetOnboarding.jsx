import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardActions,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser } from "src/api/deploy/users";
import useResource from "src/hooks/useResource";

export const ResetOnboarding = () => {
  const { keycloak } = useKeycloak();
  const { initialLoad, user, setUser } = useResource();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const reset = () => {
    setLoading(true);
    const response = updateUser(keycloak.subject, keycloak.token, {
      onboarded: false,
    });
    if (response) {
      setUser(response);
      setTimeout(() => {
        navigate("/onboarding");
      }, 500);
    }
  };

  return (
    <>
      {!(initialLoad && user) ? (
        <CircularProgress />
      ) : (
        <Card sx={{ boxShadow: 20 }}>
          <CardHeader
            title={"View onboarding"}
            subheader={
              "If you want to go through the onboarding tutorial again, click the button below."
            }
          />
          <CardActions>
            <LoadingButton loading={loading} variant="contained" onClick={reset} sx={{margin: 2}}>
              Reset onboarding
            </LoadingButton>
          </CardActions>
        </Card>
      )}
    </>
  );
};
