// mui
import {
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  CardHeader,
  ToggleButtonGroup,
  ToggleButton,
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
import ResourceComparisonTable from "./ResourceComparisonTable";
import CreateDeployment from "./CreateDeployment";
import CreateVm from "./CreateVm";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResourceTypeChat from "./ResourceTypeChat";
import { useTranslation } from "react-i18next";

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
                  <Stack spacing={3}>
                    <ResourceTypeChat />

                    <Stack spacing={3} direction="row">
                      <ToggleButtonGroup
                        color="primary"
                        value={alignment}
                        exclusive
                        onChange={(e) => setAlignment(e.target.value)}
                        aria-label="resource-type"
                      >
                        <ToggleButton value="deployment">
                          {t("resource-kubernetes-deployment")}
                        </ToggleButton>
                        <ToggleButton value="vm">
                          {t("resource-vm")}
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <ResourceComparisonTable />
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
