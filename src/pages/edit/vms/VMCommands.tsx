import { Button, Stack } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { sentenceCase } from "change-case";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmButton from "../../../components/ConfirmButton";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";
import { Vm } from "../../../types";
import { vmAction, deleteVM } from "../../../api/deploy/v2/vms";

export const VMCommands = ({ vm }: { vm: Vm }) => {
  const { t } = useTranslation();

  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();
  const navigate = useNavigate();

  const doDelete = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;

    try {
      const res = await deleteVM(keycloak.token, vm.id);

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

  const executeCommand = async (command: string) => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;

    try {
      await vmAction(keycloak.token, vm.id, { action: command });
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
          onClick={() => executeCommand("restart")}
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
