import { Link, Stack, Tooltip } from "@mui/material";
import { Deployment, Resource, Vm } from "../../types";
import { Link as RouterLink } from "react-router-dom";
import Iconify from "../Iconify";
import Label from "../Label";
import {
  GpuGroupRead,
  ZoneRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { ThemeColor } from "../../theme/types";
import { sentenceCase } from "change-case";
import { getReasonPhrase } from "http-status-codes";
import { TFunction } from "i18next";

export const renderResourceButtons = (resource: Resource) => {
  if (
    resource.type === "deployment" &&
    Object.hasOwn(resource, "url") &&
    (resource as Deployment).url !== "" &&
    (resource as Deployment).private === false
  ) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        useFlexGap={true}
        spacing={2}
      >
        <Link
          href={(resource as Deployment).url}
          target="_blank"
          rel="noreferrer"
          underline="none"
        >
          <Iconify icon="mdi:external-link" width={24} height={24} />
        </Link>
        <Link
          component={RouterLink}
          to={`/edit/${resource.type}/${resource.id}`}
        >
          <Iconify icon="mdi:pencil" width={24} height={24} />
        </Link>
      </Stack>
    );
  } else {
    return (
      <Link component={RouterLink} to={`/edit/${resource.type}/${resource.id}`}>
        <Iconify icon="mdi:pencil" width={24} height={24} />
      </Link>
    );
  }
};

export const renderResourceWithGPU = (
  resource: Resource,
  gpuGroups: GpuGroupRead[]
) => {
  if (resource.type === "vm" && (resource as Vm).gpu) {
    const group = gpuGroups?.find(
      (x) => x.id === (resource as Vm).gpu!.gpuGroupId
    );

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        {group ? (
          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
          >
            {`${group.vendor.replace("Corporation", "").trim()} ${
              group.displayName
            }`}
          </Label>
        ) : (
          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
          >
            {"GPU"}
          </Label>
        )}
      </Stack>
    );
  }
  return "";
};

export const renderResourceType = (
  resource: Resource,
  gpuGroups: GpuGroupRead[],
  t: TFunction<"translation", undefined>
) => {
  if (resource.type === "vm" && (resource as Vm).gpu) {
    const group = gpuGroups?.find(
      (x) => x.id === (resource as Vm).gpu!.gpuGroupId
    );

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Label
          variant="ghost"
          startIcon={
            <Iconify icon="carbon:virtual-machine" sx={{ opacity: 0.65 }} />
          }
        >
          VM
        </Label>
        {group ? (
          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
          >
            {`${group.vendor.replace("Corporation", "").trim()} ${
              group.displayName
            }`}
          </Label>
        ) : (
          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:gpu" sx={{ opacity: 0.65 }} />}
          >
            {"GPU"}
          </Label>
        )}
      </Stack>
    );
  }

  if (resource.type === "vm") {
    return (
      <Stack direction="row" alignItems="center">
        <Label
          variant="ghost"
          startIcon={
            <Iconify icon="carbon:virtual-machine" sx={{ opacity: 0.65 }} />
          }
        >
          VM
        </Label>
      </Stack>
    );
  }

  if (resource.type === "deployment") {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Label
          variant="ghost"
          color="info"
          startIcon={<Iconify icon="lucide:container" sx={{ opacity: 0.65 }} />}
        >
          Deployment
        </Label>
        {(resource as Deployment).private === true && (
          <Label
            variant="ghost"
            startIcon={<Iconify icon="mdi:eye-off" sx={{ opacity: 0.65 }} />}
          >
            {t("admin-visibility-private")}
          </Label>
        )}
      </Stack>
    );
  }
};

export const renderResourceStatus = (
  row: Resource,
  t: TFunction<"translation", undefined>
) => {
  const color: ThemeColor =
    (row.status === "resourceError" && "error") ||
    (row.status === "resourceUnknown" && "error") ||
    (row.status === "resourceMountFailed" && "error") ||
    (row.status === "resourceImagePullFailed" && "error") ||
    (row.status === "resourceCrashLoop" && "error") ||
    (row.status === "resourceStopped" && "warning") ||
    (row.status === "resourceRunning" && "success") ||
    "info";

  const statusMessage = sentenceCase(t(row.status).replace("resource", ""));

  return (
    <Label
      variant="ghost"
      color={color}
      startIcon={<Iconify icon="tabler:heartbeat" sx={{ opacity: 0.65 }} />}
      sx={
        row.status === "resourceStopping" ||
        row.status === "resourceStarting" ||
        row.status === "resourceProvisioning" ||
        row.status === "resourceScaling" ||
        row.status === "resourceBeingCreated" ||
        row.status === "resourceCreating" ||
        row.status === "resourceBeingDeleted" ||
        row.status === "resourceDeleting" ||
        row.status === "resourceRestarting"
          ? {
              animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite",
            }
          : null
      }
    >
      {row.type === "deployment" && row.error ? (
        <Tooltip enterTouchDelay={10} title={row.error}>
          <span>{statusMessage}</span>
        </Tooltip>
      ) : (
        statusMessage
      )}
    </Label>
  );
};

export const renderStatusCode = (row: Resource) => {
  if (!(row.type === "deployment" && (row as Deployment).pingResult))
    return <></>;

  const codeType = parseInt(
    (row as Deployment).pingResult!.toString().charAt(0)
  );

  let color: ThemeColor = "info";
  if (codeType === 2 || codeType === 3) {
    color = "success";
  } else if (codeType === 4 || codeType === 5) {
    color = "error";
  }

  return (
    <Label
      variant="ghost"
      color={color}
      startIcon={
        <Iconify icon="mdi:transit-connection-variant" sx={{ opacity: 0.65 }} />
      }
    >
      {(row as Deployment).pingResult +
        " " +
        getReasonPhrase((row as Deployment).pingResult!)}
    </Label>
  );
};

export const renderZone = (row: Resource, zones: ZoneRead[]) => {
  if (!row.zone || !zones) {
    return <></>;
  }

  const zone = zones.find(
    (zone) => zone.name === row.zone && zone.capabilities.includes(row.type)
  );

  return (
    <Label
      variant="ghost"
      startIcon={<Iconify icon="mdi:earth" sx={{ opacity: 0.65 }} />}
    >
      {zone?.description || row.zone}
    </Label>
  );
};

export const renderShared = (
  row: Resource,
  t: TFunction<"translation", undefined>
) => {
  if (row?.teams?.length === 0) return <></>;

  return (
    <Label
      variant="ghost"
      startIcon={<Iconify icon="mdi:account-group" sx={{ opacity: 0.65 }} />}
    >
      <Tooltip title={t("shared-in-group")}>
        <span>{t("shared")}</span>
      </Tooltip>
    </Label>
  );
};

function isOlderThanThreeMonths(accessedAt: string | undefined) {
  if (!accessedAt) return false;

  const accessedDate = new Date(accessedAt);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return accessedDate < threeMonthsAgo;
}

export const renderStale = (
  row: Resource,
  t: TFunction<"translation", undefined>
) => {
  const stale = isOlderThanThreeMonths(row?.accessedAt);
  if (!stale) return <></>;

  return (
    <Label
      variant="ghost"
      color="warning"
      startIcon={<Iconify icon="mdi:hourglass-full" sx={{ opacity: 0.65 }} />}
    >
      <Tooltip title={t("stale-description")}>
        <span>{t("stale")}</span>
      </Tooltip>
    </Label>
  );
};
