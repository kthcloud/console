import { Card, CardContent, CardHeader, Chip, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconify from "../../components/Iconify";
import { User } from "../../types";

export const UserQuotas = ({ user }: { user: User }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title={t("quotas")} subheader={t("quotas-subheader")} />
      <CardContent>
        <Stack
          spacing={3}
          direction={"row"}
          flexWrap={"wrap"}
          useFlexGap={true}
        >
          <Chip
            sx={{ p: 1 }}
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
                  {user.usage.cpuCores + "/" + user.quota.cpuCores}
                </b>
              </span>
            }
          />
          <Chip
            sx={{ p: 1 }}
            icon={<Iconify icon="bi:memory" width={24} height={24} />}
            label={
              <span style={{ marginLeft: ".5rem" }}>
                {t("memory")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: "1rem",
                    marginRight: ".75em",
                  }}
                >
                  {user.usage.ram + "/" + user.quota.ram}
                </b>
                GB
              </span>
            }
          />
          <Chip
            sx={{ p: 1 }}
            icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
            label={
              <span style={{ marginLeft: ".5rem" }}>
                {t("create-vm-disk-size")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: "1rem",
                    marginRight: ".75em",
                  }}
                >
                  {user.usage.diskSize + "/" + user.quota.diskSize}
                </b>{" "}
                GB
              </span>
            }
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
