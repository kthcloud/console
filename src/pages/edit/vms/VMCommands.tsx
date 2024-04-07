import { Button, Stack } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { sentenceCase } from "change-case";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteVM, applyCommand } from "../../../api/deploy/vms";
import ConfirmButton from "../../../components/ConfirmButton";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";

export const VMCommands = ({ vm }) => {
  const { t } = useTranslation();

  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();
  const navigate = useNavigate();

  const doDelete = async () => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      const res = await deleteVM(vm.id, keycloak.token);

      if (res) {
        queueJob(res);
        enqueueSnackbar(t("vm-deleting"), { variant: "info" });
        navigate("/deploy");
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-deleting-vm") + e, {
          variant: "error",
        })
      );
    }
  };

  const executeCommand = async (command) => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      await applyCommand(vm.id, command, keycloak.token);
      enqueueSnackbar(sentenceCase(command) + t("vm-in-progress"), {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-execute-command") + e, {
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
      {vm.status !== "resourceStopped" && (
        <Button
          onClick={() => executeCommand("stop")}
          variant="contained"
          startIcon={<Iconify icon="mdi:shutdown" />}
          color="warning"
        >
          {t("stop")}
        </Button>
      )}
      {vm.status === "resourceRunning" && (
        <Button
          onClick={() => executeCommand("reboot")}
          variant="contained"
          startIcon={<Iconify icon="mdi:restart" />}
          color="warning"
        >
          {t("reboot")}
        </Button>
      )}
      {!(
        vm.status === "resourceRunning" || vm.status === "resourceStarting"
      ) && (
        <Button
          onClick={() => executeCommand("start")}
          variant="contained"
          startIcon={<Iconify icon="mdi:shutdown" />}
          color="warning"
        >
          {t("start")}
        </Button>
      )}

      <ConfirmButton
        action={t("button-delete")}
        actionText={t("button-delete").toLowerCase() + " " + vm.name}
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
