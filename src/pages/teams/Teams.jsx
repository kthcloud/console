import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { acceptDeploymentTransfer } from "src/api/deploy/deployments";
import {
  deleteNotification,
  markNotificationAsRead,
} from "src/api/deploy/notifications";
import { joinTeam } from "src/api/deploy/teams";
import { acceptVmTransfer } from "src/api/deploy/vms";
import Iconify from "src/components/Iconify";
import JobList from "src/components/JobList";
import LoadingPage from "src/components/LoadingPage";
import Page from "src/components/Page";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

const Teams = () => {
  const { user, teams } = useResource();
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();

  const accept = async (notification) => {
    if (!initialized) return;

    try {
      if (notification.type === "teamInvite") {
        await joinTeam(
          keycloak.token,
          notification.content.id,
          notification.content.code
        );
      } else if (notification.type === "deploymentTransfer") {
        await acceptDeploymentTransfer(
          keycloak.token,
          notification.content.id,
          notification.content.code
        );
      } else if (notification.type === "vmTransfer") {
        await acceptVmTransfer(
          keycloak.token,
          notification.content.id,
          notification.content.code
        );
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const markAsRead = async (notification) => {
    if (!initialized) return;

    try {
      await markNotificationAsRead(keycloak.token, notification.id);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const handleDelete = async (notification) => {
    if (!initialized) return;

    try {
      await deleteNotification(keycloak.token, notification.id);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const notificationAction = (type) => {
    switch (type) {
      case "teamInvite":
        return t("invited-you-to-join-their-team");
      case "deploymentTransfer":
        return t("transferred-a-deployment-to-you");
      case "vmTransfer":
        return t("transferred-a-vm-to-you");
      default:
        return "";
    }
  };

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title={t("teams")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("teams")}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={t("current-teams")}
                  subheader={t("teams-subheader")}
                />
                <CardContent>
                  <Stack spacing={2} direction={"column"}>
                    {teams.map((team) => (
                      <Stack key={team.id} direction="column" spacing={2}>
                        <Divider sx={{ borderStyle: "dashed" }} />
                        <Typography variant="h6">{team.name}</Typography>
                        {team.members.map((member) => (
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems={"center"}
                            useFlexGap
                          >
                            <Typography variant="body1">
                              {member.email || member.username}
                            </Typography>
                            <Typography variant="caption">
                              {member.teamRole}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {member.joinedAt.replace("T", " ").split(".")[0]}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};

export default Teams;
