import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";
import { Deployment } from "../../../types";
import Iconify from "../../../components/Iconify";
import { useNavigate } from "react-router-dom";

const SSHString = ({ deployment }: { deployment: Deployment }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sshBase =
    import.meta.env.VITE_DEPLOYMENT_SSH_BASE ?? window.location.hostname;

  const ssh = `ssh ${deployment.name}@${sshBase}`;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("ssh-string")}
        subheader={t("ssh-string-subheader-deployment")}
        action={
          <Stack direction="row" alignItems="center">
            <Tooltip title={t("deployment-ssh-view-keys")}>
              <IconButton
                color="primary"
                onClick={() => navigate("/profile")}
                sx={{ fontSize: 20 }}
              >
                <Iconify icon="mdi:key-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip
              enterTouchDelay={10}
              title={
                <>
                  <Typography variant="caption">
                    {t("deployment-ssh-info")}
                  </Typography>
                </>
              }
            >
              <Iconify
                icon="mdi:help-circle-outline"
                color="primary.main"
                sx={{ fontSize: 20 }}
              />
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        {!ssh ? (
          <Skeleton height={"2rem"} sx={{ maxWidth: "30rem" }} />
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1">
              <b
                style={{
                  fontFamily: "monospace",
                }}
              >
                {ssh}
              </b>
            </Typography>
            <CopyButton content={ssh} />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default SSHString;
