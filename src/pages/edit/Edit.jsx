// mui
import {
  Container,
  Typography,
  Stack,
  Chip,
  Breadcrumbs,
  Link
} from "@mui/material";

//hooks
import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useResource from "src/hooks/useResource";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";

// utils
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import LoadingPage from "../../components/LoadingPage";
import PortManager from "./vms/PortManager";
import JobList from "../../components/JobList";

// api
import EnvManager from "./deployments/EnvManager";
import GHActions from "./deployments/GHActions";
import SSHString from "./vms/SSHString";
import Specs from "./vms/Specs";
import { GPUManager } from "./vms/GPUManager";
import { PrivateMode } from "./deployments/PrivateMode";
import { DeploymentCommands } from "./deployments/DeploymentCommands";
import { VMCommands } from "./vms/VMCommands";
import { LogsView } from "./deployments/LogsView";

export function Edit() {
  const { initialized } = useKeycloak();
  const [resource, setResource] = useState(null);
  const [envs, setEnvs] = useState([]);
  const { rows, initialLoad } = useResource();
  const [loaded, setLoaded] = useState(false);

  const allowedTypes = ["vm", "deployment"];
  let { type, id } = useParams();
  const navigate = useNavigate();

  if (!allowedTypes.includes(type)) {
    navigate("/deploy");
  }

  const loadResource = () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;

    setResource(row);
    if (type === "deployment" && !loaded) {
      setEnvs(row.envs);
    }
    setLoaded(true);
  };

  // Update resource whenever rows changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadResource, [rows]);

  return (
    <>
      {!(resource && initialLoad && initialized) ? (
        <LoadingPage />
      ) : (
        <Page title={"Editing " + resource.name}>
          <Container>
            <Stack spacing={3}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  component={RouterLink}
                  underline="hover"
                  color="inherit"
                  to="/"
                >
                  cbhcloud
                </Link>
                <Link
                  underline="hover"
                  color="inherit"
                  to="/deploy"
                  component={RouterLink}
                >
                  Deploy
                </Link>
                <span>{resource.name}</span>
              </Breadcrumbs>

              <Stack
                direction="row"
                flexWrap={"wrap"}
                alignItems={"center"}
                justifyContent={"space-between"}
                spacing={3}
                useFlexGap={true}
              >
                <Typography variant="h4">{resource.name}</Typography>
                <Chip label={sentenceCase(resource.status)} />
                <div style={{ flexGrow: "1" }} />

                {resource.type === "deployment" && (
                  <DeploymentCommands deployment={resource} />
                )}

                {resource.type === "vm" && <VMCommands vm={resource} />}
              </Stack>

              <JobList />

              {resource.type === "vm" && <Specs vm={resource} />}

              {resource.type === "vm" && <GPUManager vm={resource} />}

              {resource.type === "vm" && <PortManager vm={resource} />}

              {resource.type === "vm" && <SSHString resource={resource} />}

              {resource.type === "deployment" && (
                <EnvManager
                  deployment={resource}
                  envs={envs}
                  setEnvs={setEnvs}
                />
              )}

              {resource.type === "deployment" && (
                <PrivateMode deployment={resource} />
              )}

              {resource.type === "deployment" && (
                <GHActions resource={resource} />
              )}

              {resource.type === "deployment" && (
                <LogsView deployment={resource} />
              )}
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
