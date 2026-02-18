import {
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import useResource from "../../hooks/useResource";
import { useTranslation } from "react-i18next";
import DRAConfigPanel from "./DRAConfigPanel";
import { useEffect, useState } from "react";
import { discover } from "../../api/deploy/discover";

export default function ClusterOverviewTab() {
  const { t } = useTranslation();
  const { zones } = useResource();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    discover().then((resp) => {
      setRoles([...new Set([...resp.roles.map((r) => r.name), "admin"])]);
    });
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6">{t("clusters-overview")}</Typography>

        {zones?.map((zone) => {
          const hasDRA = zone.capabilities?.includes("dra");

          return (
            <Card key={zone.name} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {zone.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {zone.description}
                    </Typography>
                  </Stack>

                  {/* Capabilities */}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {zone.capabilities.map((cap) => (
                      <Chip
                        key={cap}
                        label={cap.toUpperCase()}
                        size="small"
                        color={cap === "dra" ? "primary" : "default"}
                      />
                    ))}
                  </Stack>

                  {/* Optional DRA section */}
                  {hasDRA && (
                    <>
                      <Divider />
                      <DRAConfigPanel zone={zone} roles={roles} />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
}
