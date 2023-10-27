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
  Link,
  Stack,
  TextareaAutosize,
  Tooltip,
  Typography,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Iconify from "src/components/Iconify";
import { useTranslation } from "react-i18next";

const GHActions = ({ resource }) => {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [actionsFile, setActionsFile] = useState(null);
  const [cliCommands, setCliCommands] = useState(null);
  const [secrets, setSecrets] = useState([]);
  const [showSecrets, setShowSecrets] = useState(false);

  const loadYaml = async () => {
    try {
      // Get the deployment yaml
      const res = await getDeploymentYaml(resource.id, keycloak.token);

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

      // Get the secrets
      const secrets = [
        {
          name: "DOCKER_USERNAME",
          value: username,
        },
        {
          name: "DOCKER_PASSWORD",
          value: password,
        },
        {
          name: "DOCKER_TAG",
          value: tag,
        },
      ];

      setSecrets(secrets);

      let cleaned = res.config;

      secrets.forEach((secret) => {
        cleaned = cleaned.replace(
          secret.value,
          "${{ secrets." + secret.name + " }}"
        );
      });

      setActionsFile(cleaned);
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
          title={t("deploy-with-docker-cli")}
          subheader={t("deploy-with-docker-cli-subheader")}
        />
        <CardContent>
          <TextareaAutosize
            value={cliCommands ? cliCommands : t("loading")}
            style={{ width: "100%", border: 0 }}
          />
        </CardContent>
        <CardActions>
          <CopyToClipboard text={cliCommands}>
            <Button> {t("copy-to-clipboard")}</Button>
          </CopyToClipboard>{" "}
        </CardActions>
      </Card>

      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("deploy-with-github-actions")}
          subheader={t("deploy-with-github-actions-subheader")}
        />
        <CardContent>
          <Stack spacing={1} useFlexGap alignItems={"flex-start"}>
            <TextareaAutosize
              value={actionsFile ? actionsFile : t("loading")}
              style={{ width: "100%", border: 0 }}
            />

            <Stack
              direction={"row"}
              spacing={1}
              useFlexGap
              alignItems={"center"}
            >
              <CopyToClipboard text={actionsFile}>
                <Button>{t("copy-to-clipboard")}</Button>
              </CopyToClipboard>

              <Typography variant="body2">
                {t("unsure-where-to-paste-this")}
                <Link
                  href="https://docs.github.com/en/actions/quickstart"
                  target="_blank"
                  rel="noreferrer"
                  ml={1}
                >
                  {t("github-actions-quickstart")}
                </Link>
              </Typography>
            </Stack>

            <Button
              variant={showSecrets ? "contained" : "outlined"}
              onClick={() => setShowSecrets(!showSecrets)}
              startIcon={
                <Iconify icon={showSecrets ? "mdi:eye-off" : "mdi:eye"} />
              }
              color={showSecrets ? "primary" : "error"}
            >
              {`${showSecrets ? t("hide") : t("show")} ${t("secrets")}`}
            </Button>

            {showSecrets && (
              <Stack
                spacing={1}
                useFlexGap
                alignItems={"flex-start"}
                my={2}
                py={3}
                sx={{
                  border: 1,
                  p: 2,
                  borderRadius: 1,
                  borderColor: "#ff534c",
                }}
                boxShadow={10}
              >
                <Typography variant="h6">{t("danger-zone")}</Typography>
                <Typography variant="body2">
                  {t("danger-zone-subheader")}
                </Typography>
                {secrets.map((secret) => (
                  <Typography
                    variant="body2"
                    fontFamily={"monospace"}
                    sx={{ cursor: "pointer" }}
                  >
                    <CopyToClipboard text={secret.name}>
                      <Tooltip title={t("copy-to-clipboard")}>
                        {`${secret.name}: `}
                      </Tooltip>
                    </CopyToClipboard>
                    <CopyToClipboard text={secret.value}>
                      <Tooltip title={t("copy-to-clipboard")}>
                        <b
                          style={{
                            fontFamily: "monospace",
                            cursor: "pointer",
                          }}
                        >
                          {secret.value}
                        </b>
                      </Tooltip>
                    </CopyToClipboard>
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default GHActions;
