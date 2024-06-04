import { LoadingButton } from "@mui/lab";
import { Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updateDeployment } from "../../../api/deploy/deployments";
import Iconify from "../../../components/Iconify";
import useResource from "../../../hooks/useResource";
import { errorHandler } from "../../../utils/errorHandler";
import { Deployment } from "../../../types";

export const ImageManager = ({ deployment }: { deployment: Deployment }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<string>("");
  const [imageArgs, setImageArgs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();
  const { queueJob } = useResource();

  useEffect(() => {
    if (deployment.image) setImage(deployment.image);
    if (deployment.args) setImageArgs(deployment.args.join(" "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (img: string, args: string) => {
    if (!(initialized && keycloak.token)) return;
    const newImage = img.trim();
    const newArgs = args.trim();

    let body = {};
    if (newImage !== deployment.image && newImage !== "") {
      body = { ...body, image: newImage };
    }
    if (newArgs !== deployment.args.join(" ")) {
      body = { ...body, args: newArgs.split(" ") };
    }

    setLoading(true);

    try {
      const res = await updateDeployment(deployment.id, body, keycloak.token);
      queueJob(res);
      enqueueSnackbar(t("saving-image-update"), {
        variant: "info",
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-save-image") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("create-deployment-image")}
        subheader={t("image-subheader")}
      />
      <CardContent>
        <Stack
          direction="row"
          spacing={3}
          alignItems={"center"}
          flexWrap={"wrap"}
          useFlexGap
        >
          {deployment.deploymentType === "prebuilt" && (
            <TextField
              label={t("image-tag")}
              variant="outlined"
              placeholder={deployment.image}
              value={image}
              onChange={(e) => setImage(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave(image, imageArgs);
                }
              }}
              fullWidth
              sx={{ maxWidth: "sm" }}
              disabled={loading}
            />
          )}
          <TextField
            label={t("run-args")}
            variant="outlined"
            placeholder={deployment.args.join(" ")}
            value={imageArgs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setImageArgs(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave(image, imageArgs);
              }
            }}
            fullWidth
            sx={{ maxWidth: "sm" }}
            disabled={loading}
          />
          <LoadingButton
            variant="contained"
            onClick={() => handleSave(image, imageArgs)}
            startIcon={<Iconify icon="material-symbols:save" />}
            loading={loading}
          >
            {t("button-save")}
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
};
