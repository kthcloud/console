import { DeploymentRead } from "@kthcloud/go-deploy-types/types/v1/body";
import {
  Fade,
  IconButton,
  IconButtonProps,
  Menu,
  MenuItem,
  Stack,
  Theme,
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
  WANTED,
}

export function ReplicaStatus({ deployment }: ReplicaProps) {
  if (deployment.replicaStatus == undefined) return <></>;
  const [expanded, setExpanded] = useState<boolean>(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget.parentElement);
    setExpanded(true);
  };
  const handleClose = () => {
    setExpanded(false); // shows up d
    setAnchorElement(null);
  };

  deployment.replicaStatus.availableReplicas = 3; // Todo: Change b4 PR
  const replicas = [
    ...Array.from(
      { length: deployment.replicaStatus.readyReplicas },
      () => ReplicaStatusEnum.READY
    ),
    ...Array.from(
      {
        length:
          deployment.replicaStatus.availableReplicas -
          deployment.replicaStatus.readyReplicas,
      },
      () => ReplicaStatusEnum.OCCUPIED
    ),
    ...Array.from(
      {
        length: deployment.replicaStatus.unavailableReplicas,
      },
      () => ReplicaStatusEnum.UNAVAILABLE
    ),
    ...Array.from(
      {
        length:
          deployment.replicaStatus.desiredReplicas -
          (deployment.replicaStatus.availableReplicas +
            deployment.replicaStatus.unavailableReplicas),
      },
      () => ReplicaStatusEnum.WANTED
    ),
  ];

  const amountReady = deployment.replicaStatus.readyReplicas;
  const amountOccupied =
    deployment.replicaStatus.availableReplicas -
    deployment.replicaStatus.readyReplicas;
  const amountUnavailable = deployment.replicaStatus.unavailableReplicas;
  const amountWanted =
    deployment.replicaStatus.desiredReplicas -
    (deployment.replicaStatus.unavailableReplicas +
      deployment.replicaStatus.availableReplicas);
  const menuElementStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  };
  return (
    <div style={{ position: "relative" }}>
      <Stack
        direction="row"
        flexWrap={"wrap"}
        alignItems={"center"}
        spacing={3}
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
        open={expanded}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {amountReady > 0 && (
          <MenuItem sx={menuElementStyle}>
            <span>{t("ready") + ":"}</span>
            <span>{amountReady}</span>
          </MenuItem>
        )}
        {amountOccupied > 0 && (
          <MenuItem sx={menuElementStyle}>
            <span>{t("occupied") + ":"}</span>
            <span>{amountOccupied}</span>
          </MenuItem>
        )}
        {amountUnavailable > 0 && (
          <MenuItem sx={menuElementStyle}>
            <span>{t("unavailable") + ":"}</span>
            <span>{amountUnavailable}</span>
          </MenuItem>
        )}
        {amountWanted > 0 && (
          <MenuItem sx={menuElementStyle}>
            <span>{t("wanted") + ":"}</span>
            <span>{amountWanted}</span>
          </MenuItem>
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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onClick) {
      onClick(e);
    }
  };
  return (
    <IconButton id={id} onClick={handleClick}>
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
    [ReplicaStatusEnum.WANTED]: {
      ...baseStyle,
      backgroundColor: theme.palette.grey[800],
    },
  };

  const style: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: "1%",
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
