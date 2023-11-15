import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconify from "src/components/Iconify";
import JobList from "src/components/JobList";
import LoadingPage from "src/components/LoadingPage";
import Page from "src/components/Page";
import useResource from "src/hooks/useResource";

const Inbox = () => {
  const { user, notifications } = useResource();
  const { t } = useTranslation();

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
                      <Typography key={notification.id}>
                        {JSON.stringify(notification.message)}
                      </Typography>
                    ))}
                    {notifications.length === 0 && (
                      <Stack direction="column" alignItems="center" spacing={3} sx={{py:3}}>
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
