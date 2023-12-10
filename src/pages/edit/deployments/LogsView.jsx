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
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "src/components/Iconify";
import polyfilledEventSource from "@sanity/eventsource";
import { useTranslation } from "react-i18next";

export const LogsView = ({ deployment }) => {
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();
  const [logs, setLogs] = useState([]);
  const [lineWrap, setLineWrap] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [connection, setConnection] = useState("connecting");
  const [sse, setSse] = useState(null);

  const initSse = () => {
    if (!(deployment && initialized)) return;

    if (sse) {
      sse.close();
    }

    let eventSource = new polyfilledEventSource(
      `${process.env.REACT_APP_DEPLOY_API_URL}/deployments/${deployment.id}/logs-sse`,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      }
    );

    console.log(eventSource);

    setSse(eventSource);

    eventSource.onerror = () => {
      eventSource.close();
      setConnection("error");
      setTimeout(() => {
        setConnection("retrying");
        initSse();
      }, 5000);
    };
    
    eventSource.addEventListener("deployment", (e) => {
      setLogs((logs) => [e.data, ...logs]);
    });
    
    eventSource.addEventListener("pod", (e) => {
      setLogs((logs) => [e.data, ...logs]);
    });
    
    eventSource.addEventListener("build", (e) => {
      setLogs((logs) => [e.data, ...logs]);
    });

    eventSource.onopen = (e) => {
      console.log(e)
      setConnection("connected");
    };
  };

  useEffect(() => {
    initSse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  if (!(deployment && logs && initialized)) return null;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={t("logs")} subheader={t("logs-subheader")} />

      <CardContent>
        <Stack direction="column" spacing={2}>
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

            <Button
              variant="contained"
              startIcon={<Iconify icon={"mdi:broom"} />}
              onClick={() => setLogs([])}
            >
              {t("button-clear")}
            </Button>

            <CopyToClipboard text={logs.join("\n")}>
              <Button
                variant="contained"
                startIcon={
                  <Iconify icon={"material-symbols:content-copy-outline"} />
                }
              >
                {t("copy")}
              </Button>
            </CopyToClipboard>

            <Button
              variant="contained"
              startIcon={<Iconify icon={"material-symbols:download"} />}
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([logs.join("\n")], {
                  type: "text/plain",
                });
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
            {logs.map((log, i) => (
              <pre
                key={"logs" + i}
                style={{
                  whiteSpace: lineWrap ? "normal" : "nowrap",
                  backgroundColor: i % 2 === 0 ? "#222" : "#000",
                  padding: compactMode ? "0" : "0.5rem",
                  flexGrow: 1,
                }}
              >
                {log}
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
        </Stack>
      </CardContent>
    </Card>
  );
};
