import { LoadingButton } from "@mui/lab";
import { Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

export const ImageManager = ({ deployment }) => {
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
      enqueueSnackbar("Saving image update...", {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not update image: " + e, {
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
        title={"Image"}
        subheader="Edit or update your deployment's image. For example mongo, mongo:4.4 or quay.io/keycloak/keycloak"
      />
      <CardContent>
        <Stack direction="row" spacing={3} useFlexGap>
          <TextField
            label="Image"
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
            Save
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
};
