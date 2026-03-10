import { Dispatch, SetStateAction, useState } from "react";
import { DeploymentGPU } from "../../types";
import { useTranslation } from "react-i18next";
import useResource from "../../hooks/useResource";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Autocomplete,
  TextField,
  Stack,
  Tooltip,
} from "@mui/material";
import { NoWrapTable as Table } from "../../components/NoWrapTable";
import Iconify from "../Iconify";
import { enqueueSnackbar } from "notistack";

export type GPUSelectorProps = {
  gpus: DeploymentGPU[];
  setGpus: Dispatch<SetStateAction<DeploymentGPU[]>>;
  zone: string;
};

export default function GPUSelector({ gpus, setGpus, zone }: GPUSelectorProps) {
  const { t } = useTranslation();
  const { gpuClaims, zones, user } = useResource();

  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const usage = ((user?.usage as any)?.gpus as number) || 0 + gpus.length;

  const selectedZone = zones.find((z) => z.name === zone);

  const draCapableZone =
    (selectedZone?.enabled &&
      selectedZone?.capabilities.some((cap) => cap === "dra")) ||
    false;

  const availableGpuClaims = gpuClaims?.filter((c) => c.zone === zone) || [];

  const addGpu = (claimName: string, gpuName: string) => {
    if (usage + 1 > (((user?.quota as any)?.gpus as number) || 1)) {
      enqueueSnackbar(t("quota-exceeded"), { variant: "error" });
      return;
    }
    setGpus((prev) => {
      if (prev.some((g) => g.claimName === claimName && g.name === gpuName))
        return prev;

      return [
        ...prev,
        {
          name: gpuName,
          claimName,
        },
      ];
    });
  };

  const removeGpu = (index: number) => {
    setGpus((prev) => prev.filter((_, i) => i !== index));
  };

  const gpuOptions = availableGpuClaims.flatMap((claim) => {
    if (!claim.requested) return [];

    return Object.entries(claim.requested).map(([requestName, req]) => ({
      claimName: claim.name,
      requestName,
      deviceClass: req.deviceClassName,
      vendor: getVendor(req.deviceClassName),
      label: `${claim.name} / ${requestName}`,
    }));
  });

  return (
    <Card>
      <CardHeader
        title={t("deployment-gpu-create-select-title")}
        subheader={t("deployment-gpu-subheader")}
        action={
          <Tooltip
            enterTouchDelay={10}
            title={
              <>
                <Typography variant="caption">
                  {t("deployment-gpu-subheader")}
                </Typography>
                <br />
                <br />
                <Typography variant="caption">
                  {t("deployment-gpu-quota")}
                </Typography>
                <br />
                <br />
                <Typography variant="caption">
                  {t("deployment-gpu-unstable")}
                </Typography>
              </>
            }
          >
            <span>
              <Iconify icon="mdi:help-circle-outline" color="primary.main" />
            </span>
          </Tooltip>
        }
      />

      <CardContent>
        {draCapableZone ? (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("deployment-gpu-claim-name")}</TableCell>
                  <TableCell>{t("deployment-gpu-name")}</TableCell>
                  <TableCell>{t("deployment-gpu-vendor")}</TableCell>
                  <TableCell>{t("deployment-gpu-count")}</TableCell>
                  <TableCell align="right">{t("admin-actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gpus.length > 0 ? (
                  gpus.map((gpu, index) => {
                    const claim = availableGpuClaims.find(
                      (c) => c.name === gpu.claimName
                    );

                    return (
                      <TableRow key={index}>
                        <TableCell>{gpu.claimName}</TableCell>
                        <TableCell>{gpu.name}</TableCell>
                        <TableCell>
                          {getVendor(
                            claim?.requested?.[gpu.name].deviceClassName
                          )}
                        </TableCell>
                        <TableCell>
                          {claim?.requested?.[gpu.name].allocationMode ===
                          "ExactCount"
                            ? claim?.requested?.[gpu.name].count || "1"
                            : "all"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            alignItems={"center"}
                            justifyContent={"flex-end"}
                          >
                            <IconButton
                              color="error"
                              aria-label="delete env"
                              component="label"
                              onClick={() => removeGpu(index)}
                            >
                              <Iconify icon="mdi:delete" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        {t("nothing-to-see-here")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Typography sx={{ mt: 2, mb: 1 }}>
              {t("deployment-gpu-add")}
            </Typography>

            <Autocomplete
              value={selectedOption}
              options={gpuOptions}
              onChange={(_, value) => {
                if (!value) return;

                addGpu(value.claimName, value.requestName);
                setSelectedOption(null);
              }}
              getOptionLabel={(o) => o.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("deployment-gpu-add")}
                  placeholder="Select GPU"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Iconify icon="mdi:gpu" sx={{ mr: 1 }} />

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{option.claimName}</span>
                    <Typography variant="caption" color="text.secondary">
                      {option.requestName} • {option.vendor}
                    </Typography>
                  </div>
                </li>
              )}
              sx={{ mt: 1 }}
            />
          </>
        ) : (
          <Typography>
            {t("deployment-gpu-create-select-zone-not-capable")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

const getVendor = (deviceClassName?: string) => {
  if (!deviceClassName) return "unknown";

  if (deviceClassName.includes("nvidia")) return "NVIDIA";
  if (deviceClassName.includes("amd")) return "AMD";
  if (deviceClassName.includes("intel")) return "Intel";

  return "GPU";
};
