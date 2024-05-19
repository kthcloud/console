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
  deployment.replicaStatus.unavailableReplicas = 3;
  const amountVisible =
    (deployment.replicaStatus.availableReplicas > 0 ? 1 : 0) +
    (deployment.replicaStatus.availableReplicas -
      deployment.replicaStatus.readyReplicas >
    0
      ? 1
      : 0) +
    (deployment.replicaStatus.unavailableReplicas > 0 ? 1 : 0);
  console.log(amountVisible);
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
          <ReplicaDisplay
            amount={deployment.replicaStatus.readyReplicas}
            status={ReplicaStatusEnum.READY}
            isFirst={true}
            isLast={
              deployment.replicaStatus.unavailableReplicas === 0 &&
              deployment.replicaStatus.availableReplicas -
                deployment.replicaStatus.readyReplicas ===
                0
            }
            width={100 / amountVisible}
            theme={theme}
          />
          <ReplicaDisplay
            amount={
              deployment.replicaStatus.availableReplicas -
              deployment.replicaStatus.readyReplicas
            }
            status={ReplicaStatusEnum.OCCUPIED}
            isFirst={deployment.replicaStatus.readyReplicas === 0}
            isLast={deployment.replicaStatus.unavailableReplicas === 0}
            width={100 / amountVisible}
            theme={theme}
          />
          <ReplicaDisplay
            amount={deployment.replicaStatus.unavailableReplicas}
            status={ReplicaStatusEnum.UNAVAILABLE}
            isLast={true}
            isFirst={
              deployment.replicaStatus.availableReplicas -
                deployment.replicaStatus.readyReplicas ===
                0 && deployment.replicaStatus.readyReplicas === 0
            }
            width={100 / amountVisible}
            theme={theme}
          />
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

function ReplicaDisplay({
  amount,
  status,
  borderRadius = undefined,
  isFirst = false,
  isLast = false,
  width = 100,
  theme,
}: {
  amount: number;
  status: ReplicaStatusEnum;
  borderRadius?: string;
  isLast?: boolean;
  isFirst?: boolean;
  width?: number;
  theme?: Theme;
}) {
  let calcMWidth =
    width / amount -
    amount -
    (amount - 1) * (0.2 / 6) -
    (100 / width - 1) * (0.2 / 6);
  if (calcMWidth < 0) calcMWidth = 0;
  const baseStyle = {
    width: "100%",
    maxWidth: `${calcMWidth}%`,
    height: `1rem`,
    borderRadius: borderRadius,
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

  const firstStyles = {
    ...styles[status],
    borderRadius: "0.5rem 0 0 0.5rem",
  };

  const lastStyles = {
    ...styles[status],
    borderRadius: "0 0.5rem 0.5rem 0",
  };

  return (
    <>
      {Array.from({ length: amount }).map((_, index) => (
        <div
          key={`${index}`}
          style={
            index === amount - 1 && isLast
              ? index === 0 && isFirst
                ? { ...lastStyles, borderRadius: "0.5rem" }
                : lastStyles
              : index === 0 && isFirst
                ? firstStyles
                : styles[status]
          }
        >
          .
        </div>
      ))}
    </>
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
