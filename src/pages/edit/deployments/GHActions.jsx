import { getDeploymentYaml } from "src/api/deploy/deployments";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { parse } from "yaml";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextareaAutosize,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";

const GHActions = ({ resource }) => {
  const { keycloak, initialized } = useKeycloak();
  const [actionsFile, setActionsFile] = useState(null);
  const [cliCommands, setCliCommands] = useState(null);

  const loadYaml = async () => {
    try {
      // Get the deployment yaml
      const res = await getDeploymentYaml(resource.id, keycloak.token);
      setActionsFile(res.config);

      // Parse docker login, build, tag, and push
      const parsed = parse(res.config);
      const registry = parsed.jobs.docker.steps[0].with.registry;
      const username = parsed.jobs.docker.steps[0].with.username;
      const password = parsed.jobs.docker.steps[0].with.password;
      const tag = parsed.jobs.docker.steps[1].with.tags;

      const commands = [
        `docker login ${registry} -u ${username} -p ${password}`,
        `docker build -t ${tag} .`,
        `docker push ${tag}`,
      ];

      // escape $ for bash
      const commandString = commands.join("\n").replace(/\$/g, "\\$");
      setCliCommands(commandString);
    } catch (e) {}
  };

  useEffect(() => {
    if (!initialized) return;
    if (actionsFile) return;
    loadYaml();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return (
    <>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title="Manually push image to registry"
          subheader={"Run this in your terminal to publish your app"}
        />
        <CardContent>
          <TextareaAutosize
            value={cliCommands ? cliCommands : "Loading..."}
            style={{ width: "100%", border: 0 }}
          />
        </CardContent>
        <CardActions>
          <CopyToClipboard text={cliCommands}>
            <Button>Copy to clipboard</Button>
          </CopyToClipboard>{" "}
        </CardActions>
      </Card>

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title="GitHub Actions YAML"
          subheader={"Run this workflow to publish your app"}
        />
        <CardContent>
          <TextareaAutosize
            value={actionsFile ? actionsFile : "Loading..."}
            style={{ width: "100%", border: 0 }}
          />
        </CardContent>
        <CardActions>
          <CopyToClipboard text={actionsFile}>
            <Button>Copy to clipboard</Button>
          </CopyToClipboard>{" "}
        </CardActions>
      </Card>
    </>
  );
};

export default GHActions;
