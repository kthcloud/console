import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import useResource from "../../hooks/useResource";

export type SpecSelectorProps = {
  cpuCores: number; // per replica
  ram: number; // per replica
  replicas: number;

  setCpuCores: Dispatch<SetStateAction<number>>;
  setRam: Dispatch<SetStateAction<number>>;
  setReplicas: Dispatch<SetStateAction<number>>;
};

export default function SpecSelector({
  cpuCores,
  ram,
  replicas,
  setCpuCores,
  setRam,
  setReplicas,
}: SpecSelectorProps) {
  const { t } = useTranslation();
  const { user } = useResource();

  const [cpuInput, setCpuInput] = useState<string>(cpuCores.toString());
  const [ramInput, setRamInput] = useState<string>(ram.toString());
  const [replicasInput, setReplicasInput] = useState<string>(
    replicas.toString()
  );

  const [cpuError, setCpuError] = useState("");
  const [ramError, setRamError] = useState("");
  const [replicasError, setReplicasError] = useState("");

  const maxCpu = user?.quota.cpuCores || 4;
  const maxRam = user?.quota.ram || 8;

  const validateQuota = (
    type: "cpu" | "ram" | "replicas",
    value: number,
    total?: number
  ): string => {
    switch (type) {
      case "cpu":
        if (total! + (user?.usage.cpuCores || 0) > maxCpu) {
          return `Total CPU (${total}) exceeds quota (${maxCpu})`;
        }
        break;

      case "ram":
        if (total! + (user?.usage.ram || 0) > maxRam) {
          return `Total RAM (${total}) exceeds quota (${maxRam} GB)`;
        }
        break;

      case "replicas":
        if (value < 0) return "Replicas cannot be negative";
        break;
    }
    return "";
  };

  const handleCpuBlur = () => {
    const value = parseFloat(cpuInput);
    if (isNaN(value) || value < 0.1) {
      setCpuError("CPU must be ≥ 0.1");
      return;
    }
    const error = validateQuota("cpu", value, value * replicas);
    setCpuError(error);
    if (!error) setCpuCores(value);
  };

  const handleRamBlur = () => {
    const value = parseFloat(ramInput);
    if (isNaN(value) || value < 0.1) {
      setRamError("RAM must be ≥ 0.1");
      return;
    }
    const error = validateQuota("ram", value, value * replicas);
    setRamError(error);
    if (!error) setRam(value);
  };

  const handleReplicasBlur = () => {
    const value = parseInt(replicasInput);
    if (isNaN(value) || value < 0) {
      setReplicasError("Replicas must be ≥ 0");
      return;
    }
    const coresInput = parseFloat(cpuInput);
    if (isNaN(coresInput) || coresInput < 0.1) {
      setCpuError("CPU must be ≥ 0.1");
      return;
    }
    const ramUInput = parseFloat(ramInput);
    if (isNaN(ramUInput) || ramUInput < 0.1) {
      setRamError("RAM must be ≥ 0.1");
      return;
    }

    const cpuTotal = coresInput * value;
    const ramTotal = ramUInput * value;

    const cpuErr = validateQuota("cpu", coresInput, cpuTotal);
    const ramErr = validateQuota("ram", ramUInput, ramTotal);
    const repErr = validateQuota("replicas", value);

    setCpuError(cpuErr);
    setRamError(ramErr);
    setReplicasError(repErr);

    if (!cpuErr && !ramErr && !repErr) setReplicas(value);
  };

  return (
    <Card>
      <CardHeader title={t("deployment-spec-selector")} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t("cpu-cores")}
              type="number"
              value={cpuInput}
              onChange={(e) => setCpuInput(e.target.value)}
              onBlur={handleCpuBlur}
              error={!!cpuError}
              helperText={cpuError}
              inputProps={{ step: 0.1, min: 0.1 }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">cores</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t("ram")}
              type="number"
              value={ramInput}
              onChange={(e) => setRamInput(e.target.value)}
              onBlur={handleRamBlur}
              error={!!ramError}
              helperText={ramError}
              inputProps={{ step: 0.1, min: 0.1 }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">GB</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t("replicas")}
              type="number"
              value={replicasInput}
              onChange={(e) => setReplicasInput(e.target.value)}
              onBlur={handleReplicasBlur}
              error={!!replicasError}
              helperText={replicasError}
              inputProps={{ step: 1, min: 0 }}
              fullWidth
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
