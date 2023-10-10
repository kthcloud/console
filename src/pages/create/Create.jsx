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

export const Create = () => {
  const { initialized } = useKeycloak();
  const { enqueueSnackbar } = useSnackbar();
  const { queueJob } = useResource();
  const [alignment, _setAlignment] = useState("");
  const setAlignment = (newAlignment) => {
    _setAlignment(newAlignment);
    setSearchParams({ type: newAlignment });
  };

  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  let [_, setSearchParams] = useSearchParams();

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
        <Page title="Create new resource">
          <Container>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                Create new resource
              </Typography>

              <JobList />

              <Card sx={{ boxShadow: 20 }}>
                <CardHeader title={"Resource type"} />
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
                          Kubernetes Deployment
                        </ToggleButton>
                        <ToggleButton value="vm">Virtual machine</ToggleButton>
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
