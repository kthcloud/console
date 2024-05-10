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
            icon={<Iconify icon="uil:processor" width={24} height={24} />}
            label={
              <span>
                {t("landing-hero-cpu")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {user.usage.cpuCores + "/" + user.quota.cpuCores}
                </b>
              </span>
            }
          />
          <Chip
            icon={<Iconify icon="bi:memory" width={24} height={24} />}
            label={
              <span>
                {t("memory")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
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
            icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
            label={
              <span>
                {t("create-vm-disk-size")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                    marginRight: ".75em",
                  }}
                >
                  {user.usage.diskSize + "/" + user.quota.diskSize}
                </b>{" "}
                GB
              </span>
            }
          />
          <Chip
            icon={
              <Iconify icon="material-symbols:save" width={24} height={24} />
            }
            label={
              <span>
                {t("snapshots")}
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {user.usage.snapshots + "/" + user.quota.snapshots}
                </b>
              </span>
            }
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
