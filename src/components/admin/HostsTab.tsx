import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import useAdmin from "../../hooks/useAdmin";
import HostMachine from "./HostMachine";
import {
  HostCapacities,
  HostVerboseRead,
  SystemCapacities,
} from "@kthcloud/go-deploy-types/types/v2/body";

const convertHostsToMap = (systemCapacities: SystemCapacities | undefined) => {
  return (
    systemCapacities?.hosts?.reduce(
      (map, host) => {
        const key = `${host.name}_${host.zone}`;
        map[key] = host;
        return map;
      },
      {} as Record<string, HostCapacities>
    ) || {}
  );
};

export default function HostsTab() {
  const { t } = useTranslation();
  const { hosts, systemCapacities } = useAdmin();

  const hostsMap = systemCapacities ? convertHostsToMap(systemCapacities) : {};

  const groupedByZone = hosts?.reduce(
    (acc, host) => {
      if (!acc[host.zone]) acc[host.zone] = { enabled: [], disabled: [] };
      host.enabled
        ? acc[host.zone].enabled.push(host)
        : acc[host.zone].disabled.push(host);
      return acc;
    },
    {} as Record<
      string,
      { enabled: HostVerboseRead[]; disabled: HostVerboseRead[] }
    >
  );

  if (groupedByZone) {
    Object.keys(groupedByZone).forEach((zone) => {
      groupedByZone[zone].enabled.sort((a, b) => a.name.localeCompare(b.name));
      groupedByZone[zone].disabled.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  return (
    <Paper sx={{ p: 2 }}>
      {hosts === undefined ? (
        <Grid container spacing={2}>
          {Array.from({ length: 9 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={140} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : groupedByZone && Object.keys(groupedByZone).length > 0 ? (
        Object.entries(groupedByZone).map(([zone, { enabled, disabled }]) => (
          <Box key={zone} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t("zone")}: {zone}
            </Typography>
            {enabled.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t("enabled")}
                </Typography>
                <Grid container spacing={2}>
                  {enabled.map((host) => (
                    <Grid item xs={12} sm={6} md={4} key={host.name}>
                      <HostMachine
                        host={host}
                        specs={hostsMap[`${host.name}_${host.zone}`]}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
            {disabled.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t("disabled")}
                </Typography>
                <Grid container spacing={2}>
                  {disabled.map((host) => (
                    <Grid item xs={12} sm={6} md={4} key={host.name}>
                      <HostMachine host={host} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        ))
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Typography variant="body2">{t("no-hosts-available")}</Typography>
        </Box>
      )}
    </Paper>
  );
}
