import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Skeleton,
  Stack,
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
import {
  deleteNotification,
  markNotificationAsRead,
} from "../../api/deploy/notifications";
import { joinTeam } from "../../api/deploy/teams";
import Iconify from "../../components/Iconify";
import JobList from "../../components/JobList";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import useResource from "../../hooks/useResource";
import { errorHandler } from "../../utils/errorHandler";
import { useTheme } from "@mui/material/styles";
import {
  NotificationRead,
  ResourceMigrationRead,
  UserReadDiscovery,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { AlertList } from "../../components/AlertList";
import { NoWrapTable as Table } from "../../components/NoWrapTable";
import {
  acceptMigration,
  deleteMigration,
} from "../../api/deploy/resourceMigrations";
import { discoverUserById } from "../../api/deploy/users";

const Inbox = () => {
  const {
    user,
    notifications,
    unread,
    resourceMigrations,
    rows,
    beginFastLoad,
  } = useResource();
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [expandedRead, setExpandedRead] = useState(false);
  const [stale, setStale] = useState<string>("");
  const theme = useTheme();
  const [userCache, setUserCache] = useState<UserReadDiscovery[]>([]);

  useEffect(() => {
    setStale("");

    notifications.forEach((notification: NotificationRead) => {
      const alreadyExists = userCache.find(
        (u) => u.id === notification.content.userId
      );

      if (!alreadyExists && keycloak.token) {
        discoverUserById(notification.content.userId, keycloak.token)
          .then((userDiscover) => setUserCache([...userCache, userDiscover]))
          .catch((e) => console.error(e));
      }
    });
    console.log(userCache);
  }, [notifications]);

  const accept = async (notification: NotificationRead) => {
    if (!(initialized && keycloak.token)) return;

    try {
      beginFastLoad();
      if (notification.type === "teamInvite") {
        await joinTeam(
          keycloak.token,
          notification.content.id,
          notification.content.code
        );
      } else if (notification.type === "resourceTransfer") {
        await acceptMigration(
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

  const markAsRead = async (notification: NotificationRead) => {
    if (!(initialized && keycloak.token)) return;

    try {
      setStale(notification.id);
      beginFastLoad();
      await markNotificationAsRead(keycloak.token, notification.id);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const handleDeleteNotification = async (notification: NotificationRead) => {
    if (!(initialized && keycloak.token)) return;

    try {
      setStale(notification.id);
      beginFastLoad();
      await deleteNotification(keycloak.token, notification.id);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const notificationAction = (type: string) => {
    switch (type) {
      case "teamInvite":
        return t("invited-you-to-join-their-team");
      case "resourceTransfer":
        return t("transferred-a-deployment-to-you");
      case "vmTransfer":
        return t("transferred-a-vm-to-you");
      default:
        return "";
    }
  };

  const handleDeleteMigration = async (migration: ResourceMigrationRead) => {
    if (!(initialized && keycloak.token)) return;

    try {
      setStale(migration.id);
      beginFastLoad();
      await deleteMigration(keycloak.token, migration.id);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("update-error") + e, {
          variant: "error",
        })
      );
    }
  };

  const renderMigrationDetails = (migration: ResourceMigrationRead) => {
    if (!migration.updateOwner) return null;
    const resource = rows.find((r) => r.id === migration.resourceId);

    let details = `${t("transfer-ownership")} ${t("of")} ${migration.resourceType} `;

    if (resource) {
      details += " " + resource.name;
    }

    details += ` ${t("to-user")} `;

    return (
      <Typography variant="body2">
        {details}
        <Typography variant="caption" sx={{ ml: 1 }}>
          {migration.updateOwner.ownerId}
        </Typography>
      </Typography>
    );
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

              <AlertList />
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
                            <TableCell>{t("notification")}</TableCell>
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
                                      {userCache.find(
                                        (u) =>
                                          u.id === notification.content.userId
                                      ) && (
                                        <Grid container>
                                          <Grid
                                            item
                                            sx={{
                                              display: "flex",
                                              width: 44,
                                            }}
                                          >
                                            {userCache.find(
                                              (u) =>
                                                u.id ===
                                                notification.content.userId
                                            )?.gravatarUrl ? (
                                              <Avatar
                                                src={
                                                  userCache.find(
                                                    (u) =>
                                                      u.id ===
                                                      notification.content
                                                        .userId
                                                  )!.gravatarUrl + "?s=32"
                                                }
                                                sx={{ width: 20, height: 20 }}
                                              />
                                            ) : (
                                              <Avatar
                                                sx={{ width: 20, height: 20 }}
                                              >
                                                <Iconify
                                                  icon="mdi:account"
                                                  sx={{
                                                    width: 16,
                                                    height: 16,
                                                  }}
                                                  title="Profile"
                                                />
                                              </Avatar>
                                            )}
                                            <Grid
                                              item
                                              sx={{
                                                width: "calc(100% - 44px)",
                                                wordWrap: "break-word",
                                                paddingLeft: 1,
                                              }}
                                            ></Grid>
                                            <Stack
                                              direction="row"
                                              alignItems={"center"}
                                              spacing={1}
                                            >
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                              >
                                                {
                                                  userCache.find(
                                                    (u) =>
                                                      u.id ===
                                                      notification.content
                                                        .userId
                                                  )?.username
                                                }
                                              </Typography>
                                              <Typography variant="body2">
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
                                          </Grid>
                                        </Grid>
                                      )}
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
                                          disabled={
                                            notification.readAt !== undefined
                                          }
                                        >
                                          {t("read")}
                                        </Button>
                                        <Button
                                          color="error"
                                          startIcon={
                                            <Iconify icon="mdi:delete" />
                                          }
                                          onClick={() =>
                                            handleDeleteNotification(
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
                                background: expandedRead
                                  ? theme.palette.grey[200]
                                  : "transparent",
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
                                                    <Typography variant="body2">
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
                                                        handleDeleteNotification(
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
                        <Typography gutterBottom variant="body1">
                          {t("empty-inbox")}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {resourceMigrations.length > 0 && (
                <Card sx={{ boxShadow: 20 }}>
                  <CardHeader title={t("pending-migrations")} />
                  <CardContent>
                    <Stack spacing={2}>
                      <TableContainer component={Paper}>
                        <Table
                          sx={{ minWidth: 650 }}
                          aria-label="notifications table"
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>{t("migration")}</TableCell>
                              <TableCell>{t("created-at")}</TableCell>
                              <TableCell align="right">
                                {t("admin-actions")}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {resourceMigrations.map((migration) => (
                              <Fragment key={migration.id}>
                                {stale !== migration.id ? (
                                  <TableRow>
                                    <TableCell>
                                      {renderMigrationDetails(migration)}
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="caption"
                                        fontFamily={"monospace"}
                                      >
                                        {
                                          migration.createdAt
                                            ?.replace("T", " ")
                                            ?.replace("Z", "")
                                            ?.split(".")[0]
                                        }
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <ButtonGroup
                                        variant="outlined"
                                        sx={{ py: 3 }}
                                      >
                                        <Button
                                          color="error"
                                          startIcon={
                                            <Iconify icon="mdi:delete" />
                                          }
                                          onClick={() =>
                                            handleDeleteMigration(migration)
                                          }
                                        >
                                          {t("remove")}
                                        </Button>
                                      </ButtonGroup>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      <Skeleton animation="wave" height={64} />
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
};

export default Inbox;
