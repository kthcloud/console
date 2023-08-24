import { Card, CardContent, CardHeader, Chip, Stack } from "@mui/material";
import Iconify from "src/components/Iconify";

export const UserQuotas = ({ user }) => {
  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={"Quotas"}
        subheader={
          "Use resources in any way that fits you, and sums up under these quotas"
        }
      />
      <CardContent>
        <Stack
          spacing={3}
          direction={"row"}
          flexWrap={"wrap"}
          useFlexGap={true}
        >
          <Chip
            m={1}
            icon={<Iconify icon="uil:processor" width={24} height={24} />}
            label={
              <span>
                CPU Cores
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
            m={1}
            icon={<Iconify icon="bi:memory" width={24} height={24} />}
            label={
              <span>
                Memory GB
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {user.usage.ram + "/" + user.quota.ram}
                </b>
              </span>
            }
          />
          <Chip
            m={1}
            icon={<Iconify icon="mdi:harddisk" width={24} height={24} />}
            label={
              <span>
                Disk GB
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {user.usage.diskSize + "/" + user.quota.diskSize}
                </b>
              </span>
            }
          />
          <Chip
            m={1}
            icon={<Iconify icon="mdi:kubernetes" width={24} height={24} />}
            label={
              <span>
                Kubernetes Deployments
                <b
                  style={{
                    fontFamily: "monospace",
                    marginLeft: ".75em",
                  }}
                >
                  {user.usage.deployments + "/" + user.quota.deployments}
                </b>
              </span>
            }
          />
          <Chip
            m={1}
            icon={<Iconify icon="material-symbols:save" width={24} height={24} />}
            label={
              <span>
                Snapshots
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
