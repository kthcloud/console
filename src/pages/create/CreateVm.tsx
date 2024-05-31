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
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import { createVM } from "../../api/deploy/vms";
import { Link } from "react-router-dom";
import RFC1035Input from "../../components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { errorHandler } from "../../utils/errorHandler";
import useResource from "../../hooks/useResource";
import ZoneSelector from "./ZoneSelector";
import { useTranslation } from "react-i18next";
import { VmCreate } from "@kthcloud/go-deploy-types/types/v2/body";

export default function CreateVm({
  finished,
}: {
  finished: (job: any, stay: boolean) => void;
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { initialized, keycloak } = useKeycloak();
  const { initialLoad, user } = useResource();

  const [cleaned, setCleaned] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");

  const [cpuCores, setCpuCores] = useState<number>(1);
  const [diskSize, setDiskSize] = useState<number>(20);
  const [ram, setRam] = useState<number>(2);

  const [cpuError, setCpuError] = useState<string | null>(null);
  const [ramError, setRamError] = useState<string | null>(null);
  const [diskError, setDiskError] = useState<string | null>(null);

  const [availableCPU, setAvailableCPU] = useState<number>(0);
  const [availableRAM, setAvailableRAM] = useState<number>(0);
  const [availableDisk, setAvailableDisk] = useState<number>(0);

  const [initialName, setInitialName] = useState<string>(
    import.meta.env.VITE_RELEASE_BRANCH
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

  const calculateCPU = (raw: string) => {
    const value = parseInt(raw);
    if (!value) {
      setCpuCores(0);
      setCpuError(t("create-vm-input-number") + ", 2-" + availableCPU);
      return;
    }

    if (value > availableCPU) {
      setCpuError(t("create-vm-max-cpu") + ": " + availableCPU);
      setCpuCores(value);
      return;
    }

    if (value < 1) {
      setCpuError(t("create-vm-minimum-cpu") + ": 1");
      setCpuCores(value);

      return;
    }

    setCpuError(null);
    setCpuCores(value);
  };

  const calculateRAM = (raw: string) => {
    const value = parseInt(raw);
    if (!value) {
      setRam(0);
      setRamError(t("create-vm-input-number") + ", 1-" + availableRAM);
      return;
    }

    if (value > availableRAM) {
      setRamError(t("create-vm-max-ram") + ": " + availableRAM);
      setRam(value);
      return;
    }

    if (value < 1) {
      setRamError(t("create-vm-minimum-ram") + ": 1 GB");
      setRam(value);
      return;
    }

    setRamError(null);
    setRam(value);
  };

  const calculateDisk = (raw: string) => {
    const value = parseInt(raw);
    if (!value) {
      setDiskSize(0);
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
    if (availableCPU < 1) return false;
    if (availableRAM < 1) return false;
    if (availableDisk < 20) return false;
    return true;
  };

  const handleCreate = async (stay: boolean) => {
    if (!(initialized && keycloak.token)) return;

    if (!cleaned || !publicKey || !cpuCores || !diskSize || !ram) {
      enqueueSnackbar(t("error-all-fields"), { variant: "error" });
      return;
    }

    const body: VmCreate = {
      name: cleaned,
      sshPublicKey: publicKey,
      cpuCores: cpuCores,
      diskSize: diskSize,
      ram: ram,
      ports: [],
    };
    // zone: selectedZone,

    try {
      const job = await createVM(keycloak.token, body);
      finished(job, stay);

      if (stay) {
        if (!import.meta.env.VITE_RELEASE_BRANCH)
          setInitialName(
            faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
          );
        setCleaned("");
        setCpuCores(1);
        setDiskSize(20);
        setRam(2);
      }
    } catch (error: any) {
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
      {!(initialLoad && user) ? (
        <CircularProgress />
      ) : (
        <>
          <Card sx={{ boxShadow: 20 }}>
            <CardHeader title={t("create-vm")} />
            <CardContent>
              <RFC1035Input
                label={t("admin-name")}
                callToAction={t("create-vm-warning")}
                type={t("admin-name")}
                variant="outlined"
                cleaned={cleaned}
                setCleaned={setCleaned}
                initialValue={initialName}
                autofocus={!window.location.pathname.includes("onboarding")}
                enableRandomize={true}
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
                    <MuiLink to="/profile" component={Link}>
                      {t("create-vm-ssh-key-subheader-link")}
                    </MuiLink>
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
                      user.admin
                        ? ""
                        : cpuError
                          ? cpuError
                          : t("create-vm-number-of-cpu-cores") +
                            ", 1-" +
                            Math.floor(availableCPU)
                    }
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={!user.admin && (cpuError ? true : false)}
                    variant="outlined"
                  />

                  <TextField
                    label="RAM"
                    id="ram"
                    value={ram}
                    onChange={(e) => calculateRAM(e.target.value)}
                    helperText={
                      user.admin
                        ? ""
                        : ramError
                          ? ramError
                          : t("create-vm-amount-of-ram") +
                            ", 1-" +
                            Math.floor(availableRAM)
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    error={!user.admin && (ramError ? true : false)}
                    variant="outlined"
                  />

                  <TextField
                    label={t("create-vm-disk-size")}
                    id="disk"
                    value={diskSize}
                    onChange={(e) => calculateDisk(e.target.value)}
                    helperText={
                      user.admin
                        ? ""
                        : diskError
                          ? diskError
                          : t("create-vm-disk-size-helper") +
                            ", 20-" +
                            Math.floor(availableDisk)
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    error={!user.admin && (diskError ? true : false)}
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
