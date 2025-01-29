import {
  HostCapacities,
  HostVerboseRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { Box, Chip, Typography, useTheme } from "@mui/material";
import BlinkingLED from "./BlinkingLED";
import TimeLeft from "./TimeLeft";
import TimeAgo from "./TimeAgo";
import { useTranslation } from "react-i18next";
import Iconify from "../Iconify";

export default function HostMachine({
  host,
  specs,
}: {
  host: HostVerboseRead;
  specs?: HostCapacities;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      // @ts-ignore weird ts issue
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: theme.palette.grey[200],
        position: "relative",
      }}
    >
      <Typography variant="h6">{host.displayName}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <BlinkingLED status={host.enabled && host.schedulable} />
        <Typography sx={{ ml: 1 }}>
          {host.schedulable ? t("schedulable") : t("unschedulable")}
        </Typography>
      </Box>
      {host.deactivatedUntil &&
        new Date(host.deactivatedUntil).getTime() - new Date().getTime() >
          0 && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            <TimeLeft targetDate={host.deactivatedUntil} />
          </Typography>
        )}

      {specs && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 1,
          }}
        >
          {specs.cpuCore && specs.cpuCore.total > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                icon={<Iconify icon="uil:processor" width={24} height={24} />}
                label={
                  <span style={{ marginLeft: ".5rem" }}>
                    {t("landing-hero-cpu")}
                    <b
                      style={{
                        fontFamily: "monospace",
                        marginLeft: "1rem",
                      }}
                    >
                      {specs.cpuCore.total}
                    </b>
                  </span>
                }
              />
            </Box>
          )}
          {specs.gpu && specs.gpu.total > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                icon={<Iconify icon="mdi:gpu" width={24} height={24} />}
                label={
                  <span style={{ marginLeft: ".5rem" }}>
                    {t("resource-gpus")}
                    <b
                      style={{
                        fontFamily: "monospace",
                        marginLeft: "1rem",
                      }}
                    >
                      {specs.gpu.total}
                    </b>
                  </span>
                }
              />
            </Box>
          )}
          {specs.ram && specs.ram.total > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                icon={<Iconify icon="bi:memory" width={24} height={24} />}
                label={
                  <span style={{ marginLeft: ".5rem" }}>
                    {t("memory")}
                    <b
                      style={{
                        fontFamily: "monospace",
                        marginLeft: "1rem",
                      }}
                    >
                      {specs.ram.total + " GB"}
                    </b>
                  </span>
                }
              />
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.5,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.6rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("last-seen")}:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.6rem",
              "& *": { fontSize: "inherit" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <TimeAgo createdAt={new Date(host.lastSeenAt).toLocaleString()} />
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.5,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.6rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("registered-at")}:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.6rem",
              "& *": { fontSize: "inherit" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <TimeAgo createdAt={new Date(host.registeredAt).toLocaleString()} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
