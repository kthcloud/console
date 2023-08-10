import { Button, Stack, Link, Tooltip } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { deleteDeployment, applyCommand } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { sentenceCase } from "change-case";

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

  const executeCommand = async (command) => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      await applyCommand(deployment.id, command, keycloak.token);
      enqueueSnackbar(sentenceCase(command) + " deployment in progress... ", {
        variant: "info",
      });
    } catch (err) {
      const errorMessage = "Cannot execute command: ";
      if (err.hasOwnProperty("errors") && Array.isArray(err.errors)) {
        err.errors.forEach((error) => {
          enqueueSnackbar(
            errorMessage + sentenceCase(error.code) + " - " + error.msg,
            { variant: "error" }
          );
        });
      } else {
        enqueueSnackbar(errorMessage + JSON.stringify(err), {
          variant: "error",
        });
      }
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
      {deployment.integrations &&
        deployment.integrations.includes("github") && (
          <Tooltip title={"Linked to GitHub"}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <Iconify icon="mdi:github" width={24} height={24} />
            </span>
          </Tooltip>
        )}

      {deployment.status === "resourceRunning" && (
        <Button
          onClick={() => executeCommand("restart")}
          variant="contained"
          to="#"
          startIcon={<Iconify icon="mdi:restart" />}
          color="warning"
        >
          Restart
        </Button>
      )}
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
