import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
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

const Inbox = () => {
  const { user, notifications } = useResource();
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
        <Page title={t("inbox")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("inbox")}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader
                  title={t("notifications")}
                  subheader={t("notificationsSubheader")}
                />
                <CardContent>
                  <Stack spacing={2}>
                    {notifications.map((notification) => (
                      <>
                        <Stack
                          direction="row"
                          spacing={3}
                          useFlexGap
                          alignItems="center"
                          justifyContent={"space-between"}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={3}
                            flexWrap={"wrap"}
                            justifyContent={"space-between"}
                            useFlexGap
                          >
                            <Typography variant="body">
                              <span>
                                {notification?.content?.email ||
                                  notification?.content?.name}
                              </span>{" "}
                              <span style={{ fontWeight: "lighter" }}>
                                {notificationAction(notification?.type)}
                              </span>{" "}
                              <span>
                                {notification?.content?.email &&
                                  notification?.content?.name}
                              </span>
                            </Typography>
                            <Typography
                              variant="caption"
                              fontFamily={"monospace"}
                            >
                              {
                                notification?.createdAt
                                  ?.replace("T", " ")
                                  ?.replace("Z", "")
                                  ?.split(".")[0]
                              }
                            </Typography>
                          </Stack>
                          <ButtonGroup
                            variant="outlined"
                            sx={{ py: 3 }}
                            orientation="vertical"
                          >
                            <Button
                              startIcon={<Iconify icon="mdi:check" />}
                              onClick={() => accept(notification)}
                            >
                              {t("accept")}
                            </Button>
                            <Button
                              startIcon={<Iconify icon="mdi:email-open" />}
                              onClick={() => markAsRead(notification)}
                              disabled={notification.readAt}
                            >
                              {t("read")}
                            </Button>
                            <Button
                              color="error"
                              startIcon={<Iconify icon="mdi:delete" />}
                              onClick={() => handleDelete(notification)}
                            >
                              {t("button-clear")}
                            </Button>
                          </ButtonGroup>
                        </Stack>
                      </>
                    ))}
                    {notifications.length === 0 && (
                      <Stack
                        direction="column"
                        alignItems="center"
                        spacing={3}
                        sx={{ py: 3 }}
                      >
                        <Typography gutterBottom variant="h2">
                          <Iconify icon="emojione-v1:sun-with-face" />
                        </Typography>
                        <Typography gutterBottom variant="body">
                          {t("empty-inbox")}
                        </Typography>
                      </Stack>
                    )}
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

export default Inbox;
