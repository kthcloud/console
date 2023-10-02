import { LoadingButton } from "@mui/lab";
import { Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";

export const DomainManager = ({ deployment }) => {
  const [domain, setDomain] = useState();
  const [loading, setLoading] = useState(false);
  const { keycloak } = useKeycloak();
  const { queueJob } = useResource();

  useEffect(() => {
    if (!deployment.url) return;
    setDomain(deployment.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (d) => {
    const newDomain = d.trim();
    if (newDomain === deployment.url) return;

    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: newDomain },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar("Saving domain update...", {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Could not update domain: " + e, {
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
        title={"Domain"}
        subheader="Edit or update your deployment's domain. Add a CNAME record for this domain pointing to app.cloud.cbh.kth.se. If you are using Cloudflare or some other proxy service, disable the proxy so our DNS lookup resolves correctly. You can reenable the proxy after the deployment is created."
      />
      <CardContent>
        <Stack direction="row" spacing={3} useFlexGap>
          <TextField
            label="Domain"
            variant="outlined"
            placeholder={deployment.url}
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value.trim());
            }}
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
            onClick={() => handleSave(domain)}
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
