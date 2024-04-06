import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useRef, useState } from "react";
import Iconify from "../../../components/Iconify";
import polyfilledEventSource from "@sanity/eventsource";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";

export const LogsView = ({ deployment }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [logs, setLogs] = useState([]);
  const [viewableLogs, setViewableLogs] = useState([]);
  const [lineWrap, setLineWrap] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [connection, setConnection] = useState("connecting");
  const [sse, setSse] = useState(null);

  const last = useRef(null);

  const initSse = () => {
    if (!(deployment && initialized)) return;

    if (sse) {
      sse.close();
    }

    let eventSource = new polyfilledEventSource(
      `${import.meta.env.VITE_DEPLOY_API_URL}/deployments/${deployment.id}/logs-sse`,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      }
    );

    setSse(eventSource);

    eventSource.onerror = () => {
      eventSource.close();
      setConnection("error");
      setTimeout(() => {
        setConnection("retrying");
        initSse();
      }, 5000);
    };

    const pushLog = (log) => {
      try {
        setLogs((logs) => [...logs, JSON.parse(log)]);
      } catch (e) {}
    };

    eventSource.addEventListener("deployment", (e) => {
      pushLog(e.data);
    });

    eventSource.addEventListener("pod", (e) => {
      pushLog(e.data);
    });

    eventSource.addEventListener("build", (e) => {
      pushLog(e.data);
    });

    eventSource.onopen = (e) => {
      setConnection("connected");
    };
  };

  useEffect(() => {
    initSse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const scrollParentToChild = (parent, child) => {
    // borrowed from https://stackoverflow.com/a/45411081
    // Where is the parent on page
    var parentRect = parent.getBoundingClientRect();
    // What can you see?
    var parentViewableArea = {
      height: parent.clientHeight,
      width: parent.clientWidth,
    };

    // Where is the child
    var childRect = child.getBoundingClientRect();
    // Is the child viewable?
    var isViewable =
      childRect.top >= parentRect.top &&
      childRect.bottom <= parentRect.top + parentViewableArea.height;

    // if you can't see the child try to scroll parent
    if (!isViewable) {
      // Should we scroll using top or bottom? Find the smaller ABS adjustment
      const scrollTop = childRect.top - parentRect.top;
      const scrollBot = childRect.bottom - parentRect.bottom;
      if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
        // we're near the top of the list
        parent.scrollTop += scrollTop;
      } else {
        // we're near the bottom of the list
        parent.scrollTop += scrollBot;
      }
    }
  };

  useEffect(
    () => {
      if (logs.length > 1000) {
        setViewableLogs(logs.slice(logs.length - 1000, logs.length));
      } else {
        setViewableLogs(logs);
      }

      if (autoScroll && last && last.current) {
        // last.current.scroll.scrollIntoView();
        scrollParentToChild(last.current.parentNode, last.current);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs]
  );

  if (!(deployment && logs && initialized)) return null;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("logs")}
        subheader={
          <>
            {t("logs-subheader") +
              " " +
              t("admin-showing") +
              " " +
              viewableLogs.length +
              "/" +
              logs.length}{" "}
            {logs.length > 1000 && (
              <>
                <br />
                {t("logs-truncated")}
              </>
            )}
          </>
        }
      />

      <CardContent>
        <Stack direction="column" spacing={2}>
          <Stack
            direction="column"
            sx={{
              maxHeight: 800,
              overflow: "auto",
              minWidth: "100%",
              backgroundColor: "#000",
              color: "#fff",
              fontSize: "0.8rem",
              padding: "0.5rem",
            }}
          >
            {logs.length > 1000 && (
              <pre
                style={{
                  whiteSpace: lineWrap ? "normal" : "nowrap",
                  backgroundColor: "#000",
                  padding: compactMode ? "0" : "0.5rem",
                  flexGrow: 1,
                }}
              >
                {t("logs-truncated")}
              </pre>
            )}

            {viewableLogs.map((log, i) => (
              <pre
                key={"logs" + i}
                style={{
                  whiteSpace: lineWrap ? "normal" : "nowrap",
                  backgroundColor: i % 2 === 0 ? "#222" : "#000",
                  padding: compactMode ? "0" : "0.5rem",
                  flexGrow: 1,
                }}
                ref={i === viewableLogs.length - 1 ? last : null}
              >
                <span>{new Date(log.createdAt).toLocaleString("sv")}</span>
                &nbsp;<span>{log.prefix}</span>
                &nbsp;{log.line}
              </pre>
            ))}

            {logs.length === 0 && (
              <pre
                style={{
                  whiteSpace: lineWrap ? "normal" : "nowrap",
                  backgroundColor: "#000",
                  padding: compactMode ? "0" : "0.5rem",
                  flexGrow: 1,
                }}
              >
                {t("no-logs-found")}
              </pre>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            flexWrap={"wrap"}
            alignItems={"center"}
            useFlexGap
          >
            <FormControlLabel
              control={
                <Switch
                  checked={lineWrap}
                  onChange={(e) => setLineWrap(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label={t("line-wrap")}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label={t("compact-view")}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label={t("auto-scroll")}
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon={"mdi:broom"} />}
              onClick={() => setLogs([])}
            >
              {t("button-clear")}
            </Button>

            <CopyButton
              content={logs
                .map((log) => `${log.createdAt} ${log.prefix} ${log.line}`)
                .join("\n")}
              variant="button"
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon={"material-symbols:download"} />}
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([
                  logs
                    .map((log) => `${log.createdAt} ${log.prefix} ${log.line}`)
                    .join("\n"),
                  {
                    type: "text/plain",
                  },
                ]);
                element.href = URL.createObjectURL(file);
                element.download = "logs_" + deployment.name + ".txt";
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
              }}
            >
              {t("download")}
            </Button>

            <Typography variant="body2">
              {t("connection-status")}: {t(connection)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
