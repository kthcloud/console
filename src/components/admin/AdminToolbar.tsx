import { useState } from "react";
import useAdmin from "../../hooks/useAdmin";
import useInterval from "../../hooks/useInterval";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

export default function AdminToolbar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { lastRefresh, refetch, loading, lastRefreshRtt } = useAdmin();
  const [timeDiffSinceLastRefresh, setTimeDiffSinceLastRefresh] =
    useState<string>("");
  useInterval(() => {
    const now = new Date().getTime();
    const diff = now - lastRefresh;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      setTimeDiffSinceLastRefresh(hours + " " + t("time-hours-ago"));
      return;
    }
    if (minutes > 0) {
      setTimeDiffSinceLastRefresh(minutes + " " + t("time-minutes-ago"));
      return;
    }

    if (seconds > 0) {
      setTimeDiffSinceLastRefresh(seconds + " " + t("time-seconds-ago"));
      return;
    }

    setTimeDiffSinceLastRefresh("0 " + t("time-seconds-ago"));
  }, 1000);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        top: "auto",
        bottom: 0,
        borderTop: 1,
        borderColor: theme.palette.grey[300],
      }}
    >
      <Toolbar>
        <Typography variant="h4">{t("admin-title")}</Typography>
        <Box component="div" sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems={"center"} spacing={3}>
          <Button variant="contained" onClick={refetch}>
            {t("admin-refresh-resources")}
          </Button>
          <Typography variant="body1">
            {loading ? (
              t("loading")
            ) : (
              <span>
                RTT:
                <span style={{ fontFamily: "monospace" }}>
                  {" " + lastRefreshRtt + " ms "}
                </span>
                {t("admin-last-load")}:
                <span style={{ fontFamily: "monospace" }}>
                  {" " + timeDiffSinceLastRefresh}
                </span>
              </span>
            )}
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
