import { Button, Stack, Link, Tooltip } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { deleteDeployment, applyCommand } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { sentenceCase } from "change-case";
import ConfirmButton from "src/components/ConfirmButton";
import { errorHandler } from "src/utils/errorHandler";

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
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error deleting resource: " + e, {
          variant: "error",
        })
      );
    }
  };

  const executeCommand = async (command) => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      await applyCommand(deployment.id, command, keycloak.token);
      enqueueSnackbar(sentenceCase(command) + " deployment in progress... ", {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Failed to update visibility: " + e, {
          variant: "error",
        })
      );
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
            href={
              deployment.customDomainUrl
                ? deployment.customDomainUrl
                : deployment.url
            }
            target="_blank"
            rel="noreferrer"
            underline="none"
            startIcon={<Iconify icon="mdi:external-link" />}
            variant="contained"
          >
            Go to page
          </Button>
        )}

      {deployment.type === "deployment" &&
        Object.hasOwn(deployment, "storageUrl") &&
        deployment.storageUrl !== "" && (
          <Button
            component={Link}
            href={`https://${deployment.storageUrl}`}
            target="_blank"
            rel="noreferrer"
            underline="none"
            startIcon={<Iconify icon="mdi:folder" />}
            variant="contained"
          >
            Go to storage
          </Button>
        )}

      <ConfirmButton
        action="Delete"
        actionText={"delete " + deployment.name}
        callback={doDelete}
        props={{
          color: "error",
          variant: "contained",
          startIcon: <Iconify icon="mdi:nuke" />,
        }}
      />
    </Stack>
  );
};
