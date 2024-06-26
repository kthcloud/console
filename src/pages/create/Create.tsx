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
import useResource from "../../hooks/useResource";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import LoadingPage from "../../components/LoadingPage";
import JobList from "../../components/JobList";
import ResourceTypeInfo from "./ResourceTypeInfo";

// api
import CreateDeployment from "./CreateDeployment";
import CreateVm from "./CreateVm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Iconify from "../../components/Iconify";
import { Job } from "../../types";
import { AlertList } from "../../components/AlertList";

export const Create = () => {
  const { initialized } = useKeycloak();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();
  const [alignment, _setAlignment] = useState("");
  const setAlignment = (newAlignment: string) => {
    _setAlignment(newAlignment);
    const params = new URLSearchParams(searchParams);
    if (!newAlignment) params.delete("type");
    else params.set("type", newAlignment);
    setSearchParams(params);
  };

  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("type")) {
      const type = searchParams.get("type");
      if (type === "deployment" || type === "vm") {
        setAlignment(type);
      } else {
        const params = new URLSearchParams(searchParams);
        params.delete("type");
        setSearchParams(params);
      }
    } else setAlignment("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = (job: Job, stay: boolean) => {
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

              <AlertList />
              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={t("resource-type")} />
                <CardContent>
                  <Stack spacing={3} direction="column" useFlexGap>
                    <ResourceTypeInfo />
                    <Typography variant="h5" sx={{ mt: 2 }}>
                      {t("choose-type")}
                    </Typography>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="flex-start"
                      useFlexGap
                    >
                      <Button
                        variant={
                          alignment === "deployment" ? "contained" : "text"
                        }
                        disabled={alignment === "deployment"}
                        size="large"
                        onClick={() => {
                          setAlignment("deployment");
                        }}
                        startIcon={<Iconify icon="lucide:container" />}
                        sx={{ px: 3 }}
                      >
                        {t("deployment")}
                      </Button>
                      <Button
                        variant={alignment === "vm" ? "contained" : "text"}
                        disabled={alignment === "vm"}
                        size="large"
                        onClick={() => {
                          setAlignment("vm");
                        }}
                        startIcon={<Iconify icon="carbon:virtual-machine" />}
                        sx={{ px: 3 }}
                      >
                        {t("vm")}
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
