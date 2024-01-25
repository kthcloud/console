// mui
import {
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  CardHeader,
  Button,
  useTheme,
} from "@mui/material";

//hooks
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useSnackbar } from "notistack";
import useResource from "/src/hooks/useResource";

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
import Iconify from "/src/components/Iconify";

export const Create = () => {
  const { initialized } = useKeycloak();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();
  const [alignment, _setAlignment] = useState("");
  const setAlignment = (newAlignment) => {
    _setAlignment(newAlignment);
    let params = new URLSearchParams(searchParams);
    if (!newAlignment) params.delete("type");
    else params.set("type", newAlignment);
    setSearchParams(params);
  };
  const theme = useTheme();

  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("type")) {
      let type = searchParams.get("type");
      if (type === "deployment" || type === "vm") {
        setAlignment(type);
      } else {
        let params = new URLSearchParams(searchParams);
        params.delete("type");
        setSearchParams(params);
      }
    } else setAlignment("");
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
                        {t("resource-kubernetes-deployment")}
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
