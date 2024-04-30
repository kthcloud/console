import { getDeploymentYaml } from "../../../api/deploy/deployments";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { parse } from "yaml";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextareaAutosize,
  Typography,
  useTheme,
} from "@mui/material";
import Iconify from "../../../components/Iconify";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";
import { Deployment } from "../../../types";
import { CustomTheme } from "../../../theme/types";

type Secret = {
  name: string;
  value: string;
};

const GHActions = ({ resource }: { resource: Deployment }) => {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [actionsFile, setActionsFile] = useState<string>("");
  const [cliCommands, setCliCommands] = useState<string>("");
  const [redacted, setRedacted] = useState<string>("");
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  const [showCliSecrets, setShowCliSecrets] = useState(false);
  const theme: CustomTheme = useTheme();

  const loadYaml = async () => {
    if (!(initialized && keycloak.token)) return;
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
      setRedacted(
        commandString
          .replace(password, "********")
          .replace(username, "********")
          .replace(registry, "********")
          .replace(tag, "********")
      );

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

      let cleaned: string = res.config;

      secrets.forEach((secret) => {
        cleaned = cleaned.replace(
          secret.value,
          "${{ secrets." + secret.name + " }}"
        );
      });

      setActionsFile(cleaned);
    } catch (e) {
      console.error(e);
    }
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
            value={
              cliCommands
                ? showCliSecrets
                  ? cliCommands
                  : redacted
                : t("loading")
            }
            style={{
              width: "100%",
              border: 0,
              color: theme.palette.grey[900],
              background: "transparent",
            }}
          />
        </CardContent>
        <CardActions>
          <CopyButton content={cliCommands} />

          <Button
            onClick={() => setShowCliSecrets(!showCliSecrets)}
            startIcon={
              <Iconify icon={showCliSecrets ? "mdi:eye-off" : "mdi:eye"} />
            }
            color={showCliSecrets ? "primary" : "error"}
          >
            {`${showCliSecrets ? t("hide") : t("show")} ${t("secrets")}`}
          </Button>

          {!showCliSecrets && (
            <Typography variant="caption">
              {t("secrets-are-redacted")}
            </Typography>
          )}
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
              style={{
                width: "100%",
                border: 0,
                color: theme.palette.grey[800],
                background: "transparent",
              }}
            />

            <Stack
              direction={"row"}
              spacing={2}
              useFlexGap
              alignItems={"center"}
            >
              <CopyButton content={actionsFile} />

              <Button
                onClick={() => setShowSecrets(!showSecrets)}
                startIcon={
                  <Iconify icon={showSecrets ? "mdi:eye-off" : "mdi:eye"} />
                }
                color={showSecrets ? "primary" : "error"}
              >
                {`${showSecrets ? t("hide") : t("show")} ${t("secrets")}`}
              </Button>

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

            {showSecrets && (
              <Box component="div" sx={{ overflowX: "auto", maxWidth: "100%" }}>
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

                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            {t("create-deployment-env-key")}
                          </TableCell>
                          <TableCell>
                            {t("create-deployment-env-value")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {secrets.map((secret, tableIndex) => (
                          <TableRow
                            key={"secret-" + tableIndex}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontFamily={"monospace"}
                                  fontWeight={"bold"}
                                >
                                  {secret.name}
                                </Typography>
                                <CopyButton content={secret.name} />
                              </Stack>
                            </TableCell>
                            <TableCell component="th" scope="row">
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontFamily={"monospace"}
                                >
                                  {secret.value}
                                </Typography>
                                <CopyButton content={secret.value} />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default GHActions;
