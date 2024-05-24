import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";
import { Vm } from "../../../types";
import { Link as BrowserLink } from "react-router-dom";

export const GPUManager = ({ vm }: { vm: Vm }) => {
  const { t } = useTranslation();
  const { initialLoad, user, gpuGroups } = useResource();

  const userCanUseGPUs = () => {
    if (!user) return false;
    return user.role.permissions.includes("useGpus");
  };

  const renderGpuChip = () => {
    if (!vm.gpu) return null;
    const group = gpuGroups?.find((x) => x.id === vm.gpu!.gpuGroupId);
    if (!group) return null;

    return (
      <Chip
        icon={<Iconify icon="mdi:gpu" width={24} height={24} />}
        label={
          <Stack
            direction={"row"}
            alignItems={"center"}
            useFlexGap={true}
            justifyContent={"space-between"}
            spacing={2}
          >
            <span>
              {`${group.vendor
                .replace("Corporation", "")
                .trim()} ${group.displayName}`}
            </span>
          </Stack>
        }
      />
    );
  };

  return (
    <>
      {!(initialLoad && user) ? (
        <CircularProgress />
      ) : (
        <>
          {userCanUseGPUs() && (
            <Card sx={{ boxShadow: 20 }}>
              <CardHeader
                title={t("gpu-lease")}
                subheader={t("gpu-lease-subheader")}
              />
              <CardContent>
                <Stack spacing={3} direction={"column"} useFlexGap={true}>
                  <Stack
                    spacing={3}
                    direction={"row"}
                    flexWrap={"wrap"}
                    useFlexGap={true}
                    alignItems={"center"}
                  >
                    {renderGpuChip()}

                    <Button component={BrowserLink} to="/gpu">
                      {t("manage-gpu-leases")}
                    </Button>
                  </Stack>

                  <Typography variant="body2">
                    {t("gpu-drivers-1")}
                    <br />
                    {t("gpu-drivers-2")}
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        paddingRight: "0.5rem",
                      }}
                    >
                      apt install nvidia-driver-550-server
                      nvidia-utils-550-server -y
                    </span>
                    <CopyButton
                      content={
                        "apt install nvidia-driver-550-server nvidia-utils-550-server -y"
                      }
                    />
                    {t("gpu-drivers-3")}

                    <Link
                      href="https://docs.cloud.cbh.kth.se/usage/virtualMachines/#attach-a-gpu"
                      target="_blank"
                      rel="noreferrer"
                      ml={1}
                    >
                      {t("learn-more")}
                    </Link>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
};
