import { LoadingButton } from "@mui/lab";
import { Card, CardContent, CardHeader, Stack, TextField } from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";
import { toUnicode } from "punycode";
import { useTranslation } from "react-i18next";

export const DomainManager = ({ deployment }) => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const { keycloak } = useKeycloak();
  const { queueJob } = useResource();
  const [initialDomain, setInitialDomain] = useState("");

  useEffect(() => {
    if (!deployment.customDomainUrl) return;

    const cleaned = toUnicode(
      deployment.customDomainUrl.replace("https://", "").trim()
    );
    setDomain(cleaned);
    setInitialDomain(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (d) => {
    const newDomain = d.trim();

    setLoading(true);

    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: newDomain },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-domain-update"), {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-update-domain") + e, {
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
        title={t("create-deployment-domain")}
        subheader={t("create-deployment-domain-subheader")}
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
            label={t("create-deployment-domain")}
            variant="outlined"
            placeholder={initialDomain}
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
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
            {t("button-save")}
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
};
