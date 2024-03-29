import { LoadingButton } from "@mui/lab";
import { Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updateDeployment } from "/src/api/deploy/deployments";
import Iconify from "/src/components/Iconify";
import useResource from "/src/hooks/useResource";
import { errorHandler } from "/src/utils/errorHandler";

export const ImageManager = ({ deployment }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { keycloak } = useKeycloak();
  const { queueJob } = useResource();

  useEffect(() => {
    if (!deployment.image) return;
    setImage(deployment.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (img) => {
    const newImage = img.trim();
    if (newImage === deployment.image) return;

    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { image: newImage },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-image-update"), {
        variant: "info",
      });
    } catch (error) {
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
          <TextField
            label={t("create-deployment-image")}
            variant="outlined"
            placeholder={deployment.image}
            value={image}
            onChange={(e) => setImage(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave(e.target.value);
              }
            }}
            fullWidth
            sx={{ maxWidth: "sm" }}
            disabled={loading}
          />
          <LoadingButton
            variant="contained"
            onClick={() => handleSave(image)}
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
