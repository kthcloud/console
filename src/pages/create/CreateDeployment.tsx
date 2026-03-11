// @mui
import { Button, Card, CardContent, CardHeader, Stack } from "@mui/material";
import { useState } from "react";
import { createDeployment } from "../../api/deploy/deployments";
import { useSnackbar } from "notistack";
import { useKeycloak } from "../../hooks/useKeycloak";
import RFC1035Input from "../../components/RFC1035Input";
import { faker } from "@faker-js/faker";
import { errorHandler } from "../../utils/errorHandler";
import useResource from "../../hooks/useResource";
import ZoneSelector from "./ZoneSelector";
import { useTranslation } from "react-i18next";
import { Volume } from "@kthcloud/go-deploy-types/types/v2/body";
import DeploymentTypeCard from "./DeploymentTypeCard";
import { DeploymentGPU, EnvVar, Visibility } from "../../types";
import EnvironmentVariableSelector from "../../components/create/EnvironmentVariableSelector";
import PersistentVolumeSelector from "../../components/create/PersistentVolumeSelector";
import GPUSelector from "../../components/create/GpuSelector";
import SpecSelector from "../../components/create/SpecSelector";
import VisibilitySelector from "../../components/create/VisibilitySelector";

export default function CreateDeployment({
  finished,
}: {
  finished: (job: any, stay: boolean) => void;
}) {
  const [cleaned, _setCleaned] = useState("");
  const { t } = useTranslation();

  const setCleaned = (value: string) => {
    if (rows.find((row) => row.name === value)) {
      enqueueSnackbar(
        t("admin-name") + " " + value + " " + t("create-already-taken"),
        {
          variant: "error",
        }
      );
      return;
    }

    _setCleaned(value);
  };

  const { initialized, keycloak } = useKeycloak();

  const { rows } = useResource();

  const [selectedZone, setSelectedZone] = useState("");
  const [image, setImage] = useState("");
  const [imageArgs, setImageArgs] = useState("");

  const [visibility, setVisibility] = useState<Visibility>("public");

  const [envs, setEnvs] = useState<EnvVar[]>([{ name: "PORT", value: "8080" }]);
  const [currentEnv, setCurrentEnv] = useState<EnvVar>({ name: "", value: "" });

  const [usePersistent, setUsePersistent] = useState(false);
  const [persistent, setPersistent] = useState<Volume[]>([]);
  const [currentVolume, setCurrentVolume] = useState<Volume>({
    name: "",
    appPath: "",
    serverPath: "",
  });

  const [cpuCores, setCpuCores] = useState<number>(0.2);
  const [ram, setRam] = useState<number>(0.5);
  const [replicas, setReplicas] = useState<number>(1);
  const [gpus, setGpus] = useState<DeploymentGPU[]>([]);

  const [initialName, setInitialName] = useState(
    import.meta.env.VITE_RELEASE_BRANCH
      ? ""
      : faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
  );
  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = async (stay: boolean) => {
    if (!(initialized && keycloak.token)) return;

    let newEnvs = envs;
    // Apply unsaved ENVS
    if (currentEnv.name != "" && currentEnv.value != "") {
      newEnvs = [...envs, currentEnv];
      setCurrentEnv({ name: "", value: "" });
    }

    let newPersistent = persistent;
    // Apply unsaved persitent
    if (
      currentVolume.name &&
      currentVolume.appPath &&
      currentVolume.serverPath
    ) {
      newPersistent = [...persistent, currentVolume];

      setCurrentVolume({ name: "", appPath: "", serverPath: "" });
    }

    // If args are "", it should be an empty array
    let newImageArgs = imageArgs.split(" ");
    if (newImageArgs.length === 1 && newImageArgs[0] === "") newImageArgs = [];

    try {
      const job = await createDeployment(
        cleaned,
        selectedZone,
        image,
        newImageArgs,
        newEnvs,
        newPersistent,
        keycloak.token,
        visibility,
        {
          cpuCores,
          ram,
          replicas,
          gpus,
        }
      );
      finished(job, stay);
      if (stay) {
        if (!import.meta.env.VITE_RELEASE_BRANCH)
          setInitialName(
            faker.word.words(3).replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-")
          );
        setCleaned("");
        setEnvs([]);

        setCurrentEnv({ name: "", value: "" });

        setUsePersistent(false);
        setPersistent([]);
        setCurrentVolume({ name: "", appPath: "", serverPath: "" });

        setGpus([]);
        setCpuCores(0.2);
        setRam(0.5);
        setReplicas(1);
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-creating-deployment") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment")}
          subheader={t("create-deployment-subheader")}
        />
        <CardContent>
          <RFC1035Input
            label={t("admin-name")}
            callToAction={t("create-deployment-name-warning")}
            type={t("create-deployment-name")}
            variant="outlined"
            cleaned={cleaned}
            setCleaned={setCleaned}
            initialValue={initialName}
            autofocus={!window.location.pathname.includes("onboarding")}
            enableRandomize={true}
          />
        </CardContent>
      </Card>

      <ZoneSelector
        alignment={"deployment"}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
      />

      <DeploymentTypeCard
        image={image}
        setImage={setImage}
        imageArgs={imageArgs}
        setImageArgs={setImageArgs}
      />

      <VisibilitySelector
        visibility={visibility}
        setVisibility={setVisibility}
      />

      <EnvironmentVariableSelector
        envs={envs}
        setEnvs={setEnvs}
        currentEnv={currentEnv}
        setCurrentEnv={setCurrentEnv}
      />

      <SpecSelector
        cpuCores={cpuCores}
        setCpuCores={setCpuCores}
        ram={ram}
        setRam={setRam}
        replicas={replicas}
        setReplicas={setReplicas}
      />

      <GPUSelector gpus={gpus} setGpus={setGpus} zone={selectedZone} />

      <PersistentVolumeSelector
        usePersistent={usePersistent}
        setUsePersistent={setUsePersistent}
        volumes={persistent}
        setVolumes={setPersistent}
        currentVolume={currentVolume}
        setCurrentVolume={setCurrentVolume}
      />

      <Stack justifyContent="flex-end" direction="row" spacing={3}>
        <Button onClick={() => handleCreate(true)} variant="outlined">
          {t("create-and-stay")}
        </Button>

        <Button onClick={() => handleCreate(false)} variant="contained">
          {t("create-and-go")}
        </Button>
      </Stack>
    </>
  );
}
