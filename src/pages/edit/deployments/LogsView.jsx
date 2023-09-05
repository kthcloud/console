import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Stack,
  Switch,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "src/components/Iconify";

export const LogsView = ({ deployment }) => {
  const { initialized, keycloak } = useKeycloak();
  const [logs, setLogs] = useState([]);
  const [lineWrap, setLineWrap] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    if (!(deployment && initialized)) return;

    const ws = new WebSocket(
      process.env.REACT_APP_DEPLOY_SOCKET_URL +
        "/deployments/" +
        deployment.id +
        "/logs"
    );
    ws.onopen = () => {
      ws.send("Bearer " + keycloak.token);
    };

    ws.onmessage = (event) => {
      setLogs((logs) => [event.data, ...logs]);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  if (!(deployment && logs && initialized)) return null;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={"Logs"} subheader={"View logs from your deployment"} />

      {/* TODO: add download logs button */}

      <CardContent>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={3} flexWrap={"wrap"} useFlexGap>
            <FormControlLabel
              control={
                <Switch
                  checked={lineWrap}
                  onChange={(e) => setLineWrap(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label="Line wrap"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label="Compact view"
            />

            <Button
              variant="contained"
              startIcon={<Iconify icon={"mdi:broom"} />}
              onClick={() => setLogs([])}
            >
              Clear logs
            </Button>

            <CopyToClipboard text={logs.join("\n")}>
              <Button
                variant="contained"
                startIcon={
                  <Iconify icon={"material-symbols:content-copy-outline"} />
                }
              >
                Copy Logs
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
              Download logs
            </Button>
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
                No logs found! Cause some trouble and check back here.
              </pre>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
