import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useResource from "../../hooks/useResource";
import { ZoneRead } from "kthcloud-types/types/v1/body";

const ZoneSelector = ({
  alignment,
  selectedZone,
  setSelectedZone,
}: {
  alignment: string;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
}) => {
  const { user, zones } = useResource();
  const { t } = useTranslation();

  const [filteredZones, setFilteredZones] = useState<ZoneRead[]>([]);
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(
    () => {
      if (!(zones && alignment)) return;
      const filtered = zones.filter((zone) => zone.type === alignment);
      setFilteredZones(filtered);

      if (!initialLoad && filtered.length > 0) {
        setSelectedZone(filtered[0].name);
        setInitialLoad(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zones, alignment]
  );

  if (!filteredZones) return <CircularProgress />;

  if (user?.role?.permissions?.includes("chooseZone")) {
    return (
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("choose-zone")}
          subheader={`${t("choose-zone-subheader-1")} ${alignment} ${t(
            "choose-zone-subheader-2"
          )}`}
        />
        <CardContent>
          <ToggleButtonGroup
            color="primary"
            value={selectedZone}
            exclusive
            onChange={(_, v) => setSelectedZone(v)}
            aria-label="zone"
          >
            {filteredZones.map((zone, index) => (
              <ToggleButton
                value={zone.name}
                key={`zones-toggle-${zone.name}-${index}`}
              >
                {zone.description}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ZoneSelector;
