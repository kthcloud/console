import { DeploymentRead } from "@kthcloud/go-deploy-types/types/v1/body";
import { IconButton, Stack } from "@mui/material";
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

export function ReplicaStatus({ deployment }: ReplicaProps) {
  if (deployment.replicaStatus == undefined) return <></>;
  const [expanded, setExpanded] = useState<boolean>(false);
  deployment.replicaStatus.availableReplicas = 2;
  deployment.replicaStatus.unavailableReplicas = 2;
  return (
    <div style={{ position: "relative" }}>
      <Stack
        direction="row"
        flexWrap={"wrap"}
        alignItems={"center"}
        spacing={deployment.replicas}
        useFlexGap={true}
        gap={"0.2rem"}
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
          gapInRem={0.2}
        />
        <ReplicaDisplay
          amount={
            deployment.replicaStatus.availableReplicas -
            deployment.replicaStatus.readyReplicas
          }
          status={ReplicaStatusEnum.OCCUPIED}
          isFirst={deployment.replicaStatus.readyReplicas === 0}
          isLast={deployment.replicaStatus.unavailableReplicas === 0}
          gapInRem={0.2}
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
          gapInRem={0.2}
        />
        <ExpandButton toggle={setExpanded} expanded={expanded} />
      </Stack>
      {expanded && (
        <Dropdown>
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
  gapInRem = 0.5,
}: {
  amount: number;
  status: ReplicaStatusEnum;
  borderRadius?: string;
  isLast?: boolean;
  isFirst?: boolean;
  gapInRem?: number;
}) {
  const baseStyle = {
    width: `${2/amount}rem`,
    height: `2rem`,
    maxWidth: `${(2/amount - amount) - (gapInRem*amount-gapInRem)} rem`,
    borderRadius: borderRadius,
    color: "rgba(0, 0, 0, 0)"
  };

  const styles = {
    [ReplicaStatusEnum.UNAVAILABLE]: {
      ...baseStyle,
      backgroundColor: "red",
    },
    [ReplicaStatusEnum.READY]: {
      ...baseStyle,
      backgroundColor: "green",
    },
    [ReplicaStatusEnum.OCCUPIED]: {
      ...baseStyle,
      backgroundColor: "blue",
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
              ? lastStyles
              : index === 0 && isFirst
                ? firstStyles
                : styles[status]
          }
        >.</div>
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

function Dropdown({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5",
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
