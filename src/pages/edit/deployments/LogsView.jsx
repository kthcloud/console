import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextareaAutosize,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";

export const LogsView = ({ deployment }) => {
  const { initialized, keycloak } = useKeycloak();
  const [logs, setLogs] = useState("");

  useEffect(() => {
    if (!(deployment && initialized)) return;

    const ws = new WebSocket(
      "wss://" +
        process.env.REACT_APP_DEPLOY_SOCKET_URL +
        "/deployments/" +
        deployment.id +
        "/logs"
    );
    ws.onopen = () => {
      ws.send("Bearer " + keycloak.token);
    };

    ws.onmessage = (event) => {
      console.log(event);
      setLogs((logs) => logs + "\n" + event.data);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  if (!(deployment && logs && initialized)) return null;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={"Logs"} subheader={"View logs from the deployment"} />
      <CardContent>
        <Box
          sx={{
            maxHeight: 500,
            overflow: "auto",
          }}
        >
          <TextareaAutosize
            value={logs}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "#000",
              color: "#fff",
              border: 0,
              borderRadius: 4,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
