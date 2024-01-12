// @mui
import {
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
  FormHelperText,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { createVM } from "src/api/deploy/vms";
import { Link } from "react-router-dom";
import RFC1035Input from "src/components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { errorHandler } from "src/utils/errorHandler";
import useResource from "src/hooks/useResource";
import ZoneSelector from "./ZoneSelector";
import { useTranslation } from "react-i18next";

export default function CreateVm({ finished }) {
  const { t } = useTranslation();
  const [cleaned, setCleaned] = useState("");

  const [selectedZone, setSelectedZone] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [cpuCores, setCpuCores] = useState(2);
  const [diskSize, setDiskSize] = useState(20);
  const [ram, setRam] = useState(4);

  const { enqueueSnackbar } = useSnackbar();
  const { initialized, keycloak } = useKeycloak();
  const { initialLoad, user } = useResource();

  const [cpuError, setCpuError] = useState(null);
  const [ramError, setRamError] = useState(null);
  const [diskError, setDiskError] = useState(null);

  const [availableCPU, setAvailableCPU] = useState(0);
  const [availableRAM, setAvailableRAM] = useState(0);
  const [availableDisk, setAvailableDisk] = useState(0);

  const [initialName, setInitialName] = useState(
    process.env.REACT_APP_RELEASE_BRANCH
      ? ""
      : faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
  );

  useEffect(() => {
    if (!user) return;

    setAvailableCPU(user.quota.cpuCores - user.usage.cpuCores);
    setAvailableRAM(user.quota.ram - user.usage.ram);
    setAvailableDisk(user.quota.diskSize - user.usage.diskSize);
    if (publicKey === "" && user.publicKeys.length > 0)
      setPublicKey(user.publicKeys[0].key);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const calculateCPU = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setCpuCores("");
      setCpuError(t("create-vm-input-number") + ", 2-" + availableCPU);
      return;
    }

    if (value > availableCPU) {
      setCpuError(t("create-vm-max-cpu") + ": " + availableCPU);
      setCpuCores(value);
      return;
    }

    if (value < 2) {
      setCpuError(t("create-vm-minimum-cpu") + ": 2");
      setCpuCores(value);

      return;
    }

    setCpuError(null);
    setCpuCores(value);
  };

  const calculateRAM = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setRam("");
      setRamError(t("create-vm-input-number") + ", 4-" + availableRAM);
      return;
    }

    if (value > availableRAM) {
      setRamError(t("create-vm-max-ram") + ": " + availableRAM);
      setRam(value);
      return;
    }

    if (value < 4) {
      setRamError(t("create-vm-minimum-ram") + ": 4 GB");
      setRam(value);
      return;
    }

    setRamError(null);
    setRam(value);
  };

  const calculateDisk = (raw) => {
    const value = parseInt(raw);
    if (!value) {
      setDiskSize("");
      setDiskError(t("create-vm-input-number") + ", 20-" + availableDisk);
      return;
    }

    if (value > availableDisk) {
      setDiskError(t("create-vm-max-disk-size") + ": " + availableDisk);
      setDiskSize(value);
      return;
    }

    if (value < 20) {
      setDiskError(t("create-vm-minimum-disk-size") + ": 20 GB");
      setDiskSize(value);
      return;
    }

    setDiskError(null);
    setDiskSize(value);
  };

  const verifyUserCanCreate = () => {
    if (!user) return false;
    if (user.admin) return true;
    if (availableCPU < 2) return false;
    if (availableRAM < 4) return false;
    if (availableDisk < 20) return false;
    return true;
  };

  const handleCreate = async (stay) => {
    if (!initialized) return;

    if (!cleaned || !publicKey || !cpuCores || !diskSize || !ram) {
      enqueueSnackbar(t("error-all-fields"), { variant: "error" });
      return;
    }

    try {
      const job = await createVM(
        cleaned,
        selectedZone,
        publicKey,
        cpuCores,
        diskSize,
        ram,
        keycloak.token
      );
      finished(job, stay);

      if (stay) {
        if (!process.env.REACT_APP_RELEASE_BRANCH)
          setInitialName(
            faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
          );
        setCleaned("");
        setCpuCores(2);
        setDiskSize(20);
        setRam(4);
      }
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-creating-vm") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  if (!verifyUserCanCreate())
    return (
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader title={t("create-vm")} />
        <CardContent>
          <Typography variant="body1">{t("create-vm-no-resources")}</Typography>
        </CardContent>
      </Card>
    );

  return (
    <>
      {!(initialLoad, user) ? (
        <CircularProgress />
      ) : (
        <>
          <Card sx={{ boxShadow: 20 }}>
            <CardHeader title={t("create-vm")} />
            <CardContent>
              <RFC1035Input
                label={t("admin-name")}
                placeholder={t("admin-name")}
                callToAction={t("create-vm-warning")}
                type={t("admin-name")}
                variant="outlined"
                cleaned={cleaned}
                setCleaned={setCleaned}
                initialValue={initialName}
                autofocus={!window.location.pathname.includes("onboarding")}
              />

              {user && (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel id="publickey-select-label">
                    {t("create-vm-ssh-key")}
                  </InputLabel>
                  <Select
                    id="publickey"
                    label={t("create-vm-ssh-key")}
                    value={publicKey}
                    onChange={(e) => {
                      setPublicKey(e.target.value);
                    }}
                  >
                    {user.publicKeys.map((key) => (
                      <MenuItem key={"ssh" + key.name} value={key.key}>
                        {key.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {t("create-vm-ssh-key-subheader")}
                    <Link to="/profile">
                      {t("create-vm-ssh-key-subheader-link")}
                    </Link>
                    .
                  </FormHelperText>
                </FormControl>
              )}
            </CardContent>
          </Card>

          <ZoneSelector
            alignment={"vm"}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
          />

          {user && (
            <Card sx={{ boxShadow: 20 }}>
              <CardHeader title={t("create-vm-select-specs")} />
              <CardContent>
                <Stack
                  spacing={3}
                  direction={"row"}
                  useFlexGap={true}
                  flexWrap={"wrap"}
                >
                  <TextField
                    label={t("landing-hero-cpu")}
                    id="cores"
                    value={cpuCores}
                    onChange={(e) => calculateCPU(e.target.value)}
                    helperText={
                      cpuError
                        ? cpuError
                        : t("create-vm-number-of-cpu-cores") +
                          ", 2-" +
                          availableCPU
                    }
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={cpuError ? true : false}
                    variant="outlined"
                  />

                  <TextField
                    label="RAM"
                    id="ram"
                    value={ram}
                    onChange={(e) => calculateRAM(e.target.value)}
                    helperText={
                      ramError
                        ? ramError
                        : t("create-vm-amount-of-ram") + ", 4-" + availableRAM
                    }
                    InputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      endAdornment: (
                        <InputAdornment position="end">GB</InputAdornment>
                      ),
                    }}
                    error={ramError ? true : false}
                    variant="outlined"
                  />

                  <TextField
                    label={t("create-vm-disk-size")}
                    id="disk"
                    value={diskSize}
                    onChange={(e) => calculateDisk(e.target.value)}
                    helperText={
                      diskError
                        ? diskError
                        : t("create-vm-disk-size-helper") +
                          ", 20-" +
                          availableDisk
                    }
                    InputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      endAdornment: (
                        <InputAdornment position="end">GB</InputAdornment>
                      ),
                    }}
                    error={diskError ? true : false}
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          <Stack
            justifyContent="flex-end"
            alignItems="center"
            direction="row"
            spacing={3}
          >
            {user.role.permissions.includes("useGpus") && (
              <Typography variant="body2">
                {t("create-vm-gpu-next-step")}
              </Typography>
            )}

            <Button onClick={() => handleCreate(true)} variant="outlined">
              {t("create-and-stay")}
            </Button>

            <Button onClick={() => handleCreate(false)} variant="contained">
              {t("create-and-go")}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
