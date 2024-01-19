// mui
import {
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  CardHeader,
  Button,
} from "@mui/material";

//hooks
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import useResource from "src/hooks/useResource";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import LoadingPage from "../../components/LoadingPage";
import JobList from "../../components/JobList";

// api
import CreateDeployment from "./CreateDeployment";
import CreateVm from "./CreateVm";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResourceTypeChat from "./ResourceTypeChat";
import { useTranslation } from "react-i18next";
import Iconify from "src/components/Iconify";

export const Create = () => {
  const { initialized } = useKeycloak();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();
  const [alignment, _setAlignment] = useState("");
  const setAlignment = (newAlignment) => {
    _setAlignment(newAlignment);
    let params = new URLSearchParams(searchParams);
    params.set("type", newAlignment);
    setSearchParams(params);
  };

  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setAlignment("deployment");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = (job, stay) => {
    queueJob(job);
    enqueueSnackbar(`Creating ${sentenceCase(alignment)}`, {
      variant: "info",
    });
    if (!stay) navigate("/edit/" + alignment + "/" + job.id);
  };

  return (
    <>
      {!initialized ? (
        <LoadingPage />
      ) : (
        <Page title={t("create-title")}>
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("create-title")}
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("resource-type")} />
                <CardContent>
                  <Stack spacing={3} direction="column" useFlexGap>
                    <ResourceTypeChat />
                    <Typography variant="h5" sx={{ mt: 2 }}>
                      {t("choose-type")}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                    >
                      <Button
                        color="primary"
                        variant="contained"
                        disabled={alignment === "deployment"}
                        size="large"
                        onClick={() => {
                          setAlignment("deployment");
                        }}
                        startIcon={<Iconify icon="lucide:container" />}
                      >
                        {t("resource-kubernetes-deployment")}
                      </Button>
                      <Button
                        color="primary"
                        variant="contained"
                        disabled={alignment === "vm"}
                        size="large"
                        onClick={() => {
                          setAlignment("vm");
                        }}
                        startIcon={<Iconify icon="carbon:virtual-machine" />}
                      >
                        {t("resource-vm")}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {alignment === "deployment" && (
                <CreateDeployment finished={finished} />
              )}
              {alignment === "vm" && <CreateVm finished={finished} />}
            </Stack>
          </Container>
        </Page>
      )}{" "}
    </>
  );
};
