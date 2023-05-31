import { Button, Stack, Link } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { deleteDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";

export const DeploymentCommands = ({ deployment }) => {
  const { queueJob } = useResource();
  const { initialized, keycloak } = useKeycloak();
  const navigate = useNavigate();

  const doDelete = async () => {
    if (!initialized) return;

    try {
      const res = await deleteDeployment(deployment.id, keycloak.token);

      if (res) {
        queueJob(res);
        enqueueSnackbar("Resource deleting... ", { variant: "info" });
        navigate("/deploy");
      }
    } catch (err) {
      enqueueSnackbar(err, { variant: "error" });
    }
  };
  return (
    <Stack
      direction="row"
      flexWrap={"wrap"}
      alignItems={"center"}
      spacing={3}
      useFlexGap={true}
    >
      {deployment.type === "deployment" &&
        Object.hasOwn(deployment, "url") &&
        deployment.url !== "" &&
        deployment.private === false && (
          <Button
            component={Link}
            href={deployment.url}
            target="_blank"
            rel="noreferrer"
            underline="none"
            startIcon={<Iconify icon="mdi:external-link" />}
            variant="contained"
          >
            Go to page
          </Button>
        )}
      <Button
        onClick={doDelete}
        variant="contained"
        to="#"
        startIcon={<Iconify icon="mdi:nuke" />}
        color="error"
      >
        Delete
      </Button>
    </Stack>
  );
};
