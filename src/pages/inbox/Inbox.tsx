import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { acceptDeploymentTransfer } from "../../api/deploy/deployments";
import {
  deleteNotification,
  markNotificationAsRead,
} from "../../api/deploy/notifications";
import { joinTeam } from "../../api/deploy/teams";
import { acceptVmTransfer } from "../../api/deploy/vms";
import Iconify from "../../components/Iconify";
import JobList from "../../components/JobList";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import useResource from "../../hooks/useResource";
import { errorHandler } from "../../utils/errorHandler";
import { useTheme } from "@mui/material/styles";

const Inbox = () => {
  const { user, notifications, unread } = useResource();
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [expandedRead, setExpandedRead] = useState(false);
  const [stale, setStale] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    setStale(null);
  }, [notifications]);

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
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    } finally {
      markAsRead(notification);
    }
  };

  const markAsRead = async (notification) => {
    if (!initialized) return;

    try {
      setStale(notification.id);
      await markNotificationAsRead(keycloak.token, notification.id);
    } catch (error: any) {
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
      setStale(notification.id);
      await deleteNotification(keycloak.token, notification.id);
    } catch (error: any) {
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
                    <TableContainer component={Paper}>
                      <Table
                        sx={{ minWidth: 650 }}
                        aria-label="notifications table"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Notification</TableCell>
                            <TableCell align="right">
                              {t("admin-actions")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {notifications.map((notification) => (
                            <Fragment key={notification.id}>
                              {!notification.readAt &&
                                stale !== notification.id && (
                                  <TableRow>
                                    <TableCell>
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
                                          <span
                                            style={{ fontWeight: "lighter" }}
                                          >
                                            {notificationAction(
                                              notification?.type
                                            )}
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
                                    </TableCell>
                                    <TableCell align="right">
                                      <ButtonGroup
                                        variant="outlined"
                                        sx={{ py: 3 }}
                                      >
                                        <Button
                                          startIcon={
                                            <Iconify icon="mdi:check" />
                                          }
                                          onClick={() => accept(notification)}
                                        >
                                          {t("accept")}
                                        </Button>
                                        <Button
                                          startIcon={
                                            <Iconify icon="mdi:email-open" />
                                          }
                                          onClick={() =>
                                            markAsRead(notification)
                                          }
                                          disabled={notification.readAt}
                                        >
                                          {t("read")}
                                        </Button>
                                        <Button
                                          color="error"
                                          startIcon={
                                            <Iconify icon="mdi:delete" />
                                          }
                                          onClick={() =>
                                            handleDelete(notification)
                                          }
                                        >
                                          {t("button-clear")}
                                        </Button>
                                      </ButtonGroup>
                                    </TableCell>
                                  </TableRow>
                                )}

                              {stale === notification.id &&
                                !notification.readAt && (
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      <Skeleton animation="wave" height={64} />
                                    </TableCell>
                                  </TableRow>
                                )}
                            </Fragment>
                          ))}
                          {notifications.length - unread > 0 && (
                            <TableRow
                              sx={{
                                background:
                                  expandedRead && theme.palette.grey[300],
                                cursor: "pointer",
                              }}
                              onClick={() => setExpandedRead(!expandedRead)}
                            >
                              <TableCell>{`${t("read-notifications")} (${
                                notifications.length - unread
                              })`}</TableCell>

                              <TableCell align="right">
                                <Iconify
                                  icon={
                                    expandedRead
                                      ? "mdi:expand-less"
                                      : "mdi:expand-more"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          )}
                          {expandedRead && (
                            <TableRow>
                              <TableCell colSpan={2}>
                                <TableContainer component={Paper}>
                                  <Table
                                    sx={{ minWidth: 650 }}
                                    aria-label="archived notifications table"
                                  >
                                    <TableBody>
                                      {notifications.map((notification) => (
                                        <Fragment key={notification.id}>
                                          {notification.readAt &&
                                            stale !== notification.id && (
                                              <TableRow>
                                                <TableCell>
                                                  <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={3}
                                                    flexWrap={"wrap"}
                                                    justifyContent={
                                                      "space-between"
                                                    }
                                                    useFlexGap
                                                  >
                                                    <Typography variant="body">
                                                      <span>
                                                        {notification?.content
                                                          ?.email ||
                                                          notification?.content
                                                            ?.name}
                                                      </span>{" "}
                                                      <span
                                                        style={{
                                                          fontWeight: "lighter",
                                                        }}
                                                      >
                                                        {notificationAction(
                                                          notification?.type
                                                        )}
                                                      </span>{" "}
                                                      <span>
                                                        {notification?.content
                                                          ?.email &&
                                                          notification?.content
                                                            ?.name}
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
                                                </TableCell>
                                                <TableCell align="right">
                                                  <ButtonGroup
                                                    variant="outlined"
                                                    sx={{ py: 3 }}
                                                  >
                                                    <Button
                                                      startIcon={
                                                        <Iconify icon="mdi:check" />
                                                      }
                                                      onClick={() =>
                                                        accept(notification)
                                                      }
                                                    >
                                                      {t("accept")}
                                                    </Button>
                                                    <Button
                                                      color="error"
                                                      startIcon={
                                                        <Iconify icon="mdi:delete" />
                                                      }
                                                      onClick={() =>
                                                        handleDelete(
                                                          notification
                                                        )
                                                      }
                                                    >
                                                      {t("button-clear")}
                                                    </Button>
                                                  </ButtonGroup>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          {notification.readAt &&
                                            stale === notification.id && (
                                              <TableRow>
                                                <TableCell colSpan={2}>
                                                  <Skeleton
                                                    animation="wave"
                                                    height={64}
                                                  />
                                                </TableCell>
                                              </TableRow>
                                            )}
                                        </Fragment>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

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
