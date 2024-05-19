import { DeploymentRead } from "@kthcloud/go-deploy-types/types/v1/body";
import { IconButton, Stack, Theme, useTheme } from "@mui/material";
import Iconify from "../../../components/Iconify";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ReplicaProps {
  deployment: DeploymentRead;
}

export enum ReplicaStatusEnum {
  READY,
  OCCUPIED,
  UNAVAILABLE,
}
/*
TODO: Work on width calculation so it doesnt end up janky
current borderRadius gets wierd once there are alot, make the border radius on an outside div or element of some sort.
 */
export function ReplicaStatus({ deployment }: ReplicaProps) {
  if (deployment.replicaStatus == undefined) return <></>;
  const [expanded, setExpanded] = useState<boolean>(false);
  const theme = useTheme();
  deployment.replicaStatus.availableReplicas = 3;
  deployment.replicaStatus.unavailableReplicas = 5;
  const replicas = [];
  for (let i in Array.from({
    length: deployment.replicaStatus.readyReplicas,
  })) {
    replicas.push(ReplicaStatusEnum.READY);
  }
  for (let i in Array.from({
    length:
      deployment.replicaStatus.availableReplicas -
      deployment.replicaStatus.readyReplicas,
  })) {
    replicas.push(ReplicaStatusEnum.OCCUPIED);
  }
  for (let i in Array.from({
    length: deployment.replicaStatus.unavailableReplicas,
  })) {
    replicas.push(ReplicaStatusEnum.UNAVAILABLE);
  }
  return (
    <div style={{ position: "relative" }}>
      <Stack
        direction="row"
        flexWrap={"wrap"}
        alignItems={"center"}
        spacing={deployment.replicas}
        useFlexGap={true}
      >
        <Stack
          direction="row"
          flexWrap={"wrap"}
          alignItems={"center"}
          spacing={deployment.replicas}
          useFlexGap={true}
          gap={"0.1rem"}
          width={"6rem"}
        >
          <ReplicaDisplay replicas={replicas} theme={theme} />
        </Stack>
        <ExpandButton toggle={setExpanded} expanded={expanded} />
      </Stack>
      {expanded && (
        <Dropdown theme={theme}>
          <ReplicaDetails deployment={deployment} />
        </Dropdown>
      )}
    </div>
  );
}

function ExpandButton({
  toggle,
  expanded,
}: {
  toggle: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
}) {
  return (
    <IconButton onClick={() => toggle(!expanded)}>
      <Iconify icon={expanded ? "mdi-chevron-up" : "mdi-chevron-down"} />
    </IconButton>
  );
}

function Dropdown({ children, theme }: { children: ReactNode; theme: Theme }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        backgroundColor: theme.palette["background"].default,
        borderRadius: "0.5rem",
        padding: "0.5rem",
        zIndex: "1",
      }}
    >
      {children}
    </div>
  );
}

function ReplicaDetails({ deployment }: { deployment: DeploymentRead }) {
  if (deployment.replicaStatus == undefined) return <></>;
  const { t } = useTranslation();
  const listElementStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  };
  return (
    <ul style={{ listStyle: "none" }}>
      <li style={listElementStyle}>
        <span>{t("ready") + ":"}</span>
        <span>{deployment.replicaStatus.readyReplicas}</span>
      </li>
      <li style={listElementStyle}>
        <span>{t("occupied") + ":"}</span>
        <span>
          {deployment.replicaStatus.availableReplicas -
            deployment.replicaStatus.readyReplicas}
        </span>
      </li>
      <li style={listElementStyle}>
        <span>{t("unavailable") + ":"}</span>
        <span>{deployment.replicaStatus.unavailableReplicas}</span>
      </li>
    </ul>
  );
}

function ReplicaDisplay({
  replicas,
  theme,
}: {
  replicas: ReplicaStatusEnum[];
  theme?: Theme;
}) {
  const baseStyle = {
    width: "100%",
    height: `1rem`,
    color: "rgba(0, 0, 0, 0)",
  };

  const styles = {
    [ReplicaStatusEnum.UNAVAILABLE]: {
      ...baseStyle,
      backgroundColor: theme?.palette["error"].main,
    },
    [ReplicaStatusEnum.READY]: {
      ...baseStyle,
      backgroundColor: theme?.palette["success"].main,
    },
    [ReplicaStatusEnum.OCCUPIED]: {
      ...baseStyle,
      backgroundColor: theme?.palette["info"].main,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1%",
        width: "100%",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      {replicas.map((replica, index) => (
        <div key={`${index}`} style={styles[replica]}></div>
      ))}
    </div>
  );
}
