import { DeploymentRead } from "@kthcloud/go-deploy-types/types/v2/body";
import {
  Fade,
  IconButton,
  IconButtonProps,
  Menu,
  Stack,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
export interface ReplicaProps {
  deployment: DeploymentRead;
}

enum ReplicaStatusEnum {
  READY,
  OCCUPIED,
  UNAVAILABLE,
  DESIRED,
}

export function ReplicaStatus({ deployment }: ReplicaProps) {
  if (deployment.replicaStatus == undefined) return <></>;
  const [expanded, setExpanded] = useState<boolean>(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
    setExpanded(true);
  };
  const handleClose = () => {
    setExpanded(false);
    setAnchorElement(null);
  };

  const amountReady = deployment.replicaStatus.readyReplicas;
  const amountOccupied =
    deployment.replicaStatus.availableReplicas -
    deployment.replicaStatus.readyReplicas;
  const amountUnavailable = deployment.replicaStatus.unavailableReplicas;
  const amountDesired =
    deployment.replicaStatus.desiredReplicas -
    (deployment.replicaStatus.unavailableReplicas +
      deployment.replicaStatus.availableReplicas);

  const replicas = [
    ...Array.from({ length: amountReady }, () => ReplicaStatusEnum.READY),
    ...Array.from(
      {
        length: amountOccupied,
      },
      () => ReplicaStatusEnum.OCCUPIED
    ),
    ...Array.from(
      {
        length: amountUnavailable,
      },
      () => ReplicaStatusEnum.UNAVAILABLE
    ),
    ...Array.from(
      {
        length: amountDesired,
      },
      () => ReplicaStatusEnum.DESIRED
    ),
  ];

  const menuElementStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    width: "inherit",
    padding: "0 0.7rem 0 0.7rem",
  };
  return (
    <div style={{ position: "relative" }}>
      <Stack
        direction="row"
        flexWrap={"wrap"}
        alignItems={"center"}
        spacing={1}
        useFlexGap={true}
      >
        <ReplicaDisplay replicas={replicas} theme={theme} />
        <ExpandReplicaStatusButton
          id="expand-button"
          onClick={handleClick}
          expanded={expanded}
        />
      </Stack>
      <Menu
        MenuListProps={{
          "aria-labelledby": "expand-button",
        }}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={expanded}
        onClose={handleClose}
        TransitionComponent={Fade}
        disableScrollLock={true}
        sx={{ zIndex: 1 }}
      >
        <Typography
          sx={{
            ...menuElementStyle,
            borderBottom: `1px dashed ${theme.palette.grey[300]}`,
            paddingBottom: "0.2rem",
            marginBottom: "0.7rem",
          }}
        >
          {t("replica-status")}
        </Typography>
        {amountReady > 0 && (
          <Typography style={menuElementStyle}>
            <span>{t("ready") + ":"}</span>
            <span>{amountReady}</span>
          </Typography>
        )}
        {amountOccupied > 0 && (
          <Typography sx={menuElementStyle}>
            <span>{t("occupied") + ":"}</span>
            <span>{amountOccupied}</span>
          </Typography>
        )}
        {amountUnavailable > 0 && (
          <Typography sx={menuElementStyle}>
            <span>{t("unavailable") + ":"}</span>
            <span>{amountUnavailable}</span>
          </Typography>
        )}
        {amountDesired > 0 && (
          <Typography sx={menuElementStyle}>
            <span>{t("desired") + ":"}</span>
            <span>{amountDesired}</span>
          </Typography>
        )}
      </Menu>
    </div>
  );
}

export interface ExpandReplicaStatusButtonProps extends IconButtonProps {
  expanded: boolean;
}

function ExpandReplicaStatusButton({
  id,
  onClick,
  expanded,
}: ExpandReplicaStatusButtonProps) {
  return (
    <IconButton id={id} onClick={onClick} size="small">
      <Iconify icon={expanded ? "mdi-chevron-up" : "mdi-chevron-down"} />
    </IconButton>
  );
}

function ReplicaDisplay({
  replicas,
  theme,
}: {
  replicas: ReplicaStatusEnum[];
  theme: Theme;
}) {
  const baseStyle = {
    width: "100%",
    height: `1rem`,
    color: "rgba(0, 0, 0, 0)",
  };

  const styles = {
    [ReplicaStatusEnum.UNAVAILABLE]: {
      ...baseStyle,
      backgroundColor: theme.palette["error"].main,
    },
    [ReplicaStatusEnum.READY]: {
      ...baseStyle,
      backgroundColor: theme.palette["success"].main,
    },
    [ReplicaStatusEnum.OCCUPIED]: {
      ...baseStyle,
      backgroundColor: theme.palette["info"].main,
    },
    [ReplicaStatusEnum.DESIRED]: {
      ...baseStyle,
      backgroundColor: theme.palette.grey[800],
    },
  };

  const style: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: replicas.length < 20 ? "max(2px, 1%)" : "0",
    width: "100%",
    borderRadius: "0.5rem",
    overflow: "hidden",
  };

  return (
    <Stack
      direction="row"
      flexWrap={"wrap"}
      alignItems={"center"}
      spacing={3}
      useFlexGap={true}
      gap={"0.1rem"}
      width={"6rem"}
    >
      <div style={style}>
        {replicas.map((replica, index) => (
          <div key={index} style={styles[replica]}></div>
        ))}
      </div>
    </Stack>
  );
}

export default ReplicaStatus;
