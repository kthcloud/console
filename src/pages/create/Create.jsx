// mui
import {
  Card,
  CardContent,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  CardHeader,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useAlert from "src/hooks/useAlert";
import useResource from "src/hooks/useResource";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
import LoadingPage from "../../components/LoadingPage";
import JobList from "../../components/JobList";

// api
import ResourceComparisonTable from "./ResourceComparisonTable";
import CreateDeployment from "./CreateDeployment";
import CreateVm from "./CreateVm";
import { useNavigate } from "react-router-dom";

export const Create = () => {
  const { initialized } = useKeycloak();
  const { setAlert } = useAlert();
  const { queueJob } = useResource();
  const [alignment, setAlignment] = useState("deployment");
  const navigate = useNavigate();

  const finished = (job, stay) => {
    queueJob(job);
    setAlert(sentenceCase(alignment) + " created successfully", "success");
    if (!stay) navigate("/edit/" + alignment + "/" + job.id);
  };

  return (
    <>
      {!initialized ? (
        <LoadingPage />
      ) : (
        <Page title="Profile">
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
                    <ResourceComparisonTable />

                    <ToggleButtonGroup
                      color="primary"
                      value={alignment}
                      exclusive
                      onChange={(e) => setAlignment(e.target.value)}
                      aria-label="resource-type"
                    >
                      <ToggleButton value="deployment">
                        <Iconify
                          icon="mdi:kubernetes"
                          width={24}
                          height={24}
                          mr={1}
                        />{" "}
                        Kubernetes Deployment
                      </ToggleButton>
                      <ToggleButton value="vm">
                        <Iconify
                          icon="carbon:virtual-machine"
                          width={24}
                          height={24}
                          mr={1}
                        />{" "}
                        Virtual machine
                      </ToggleButton>
                    </ToggleButtonGroup>
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
