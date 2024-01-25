import {
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GenAITooltip } from "/src/components/GenAITooltip";
import Iconify from "/src/components/Iconify";
import ResourceComparisonTable from "./ResourceComparisonTable";

const ResourceTypeChat = () => {
  const [response, setResponse] = useState(null);
  const [input, setInput] = useState("");
  const [lastInput, setLastInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const exampleInputs = [
      t("llama-mysql"),
      t("llama-machine-learning"),
      t("llama-react-frontend"),
    ];
    setLastInput(
      exampleInputs[Math.floor(Math.random() * exampleInputs.length)]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const askLlama = async (question) => {
    if (!question) return;
    setLastInput(question);
    setLoading(true);

    let body = JSON.stringify({
      prompt:
        "This is a conversation between user and llama, a friendly chatbot. respond in simple markdown. you need to help the used determine whether they should use a kubernetes deployment or a virtual machine based on their specified use case. Here are the differences: Kubernetes Deployment - Used for stateless frontend and backend services. Allows for CI/CD through GitHub Actions and other pipelines. Your repo must have a Dockerfile. VM (Virtual Machine) - Provides the ability to run an operating system directly. More versatile but deployment and maintenance will be more difficult. Ideal for GPU compute and databases, anything that requires persistent storage. \n\nUser: mysql database \n\n\nllama: You should probably use a Virtual Machine for your MySQL database in order to keep the data persisted.\n\nUser: Machine learning\n\n\nllama: A Virtual Machine would be preferrable to utilize GPU\n\nUser: react frontend\n\n\nllama:A kubernetes deployments is favorable as it is lightweight and the perfect resource type to host your frontend app.\n\nUser: " +
        question +
        "\n\n\nllama:",
      frequency_penalty: 0,
      n_predict: 400,
      presence_penalty: 0,
      repeat_last_n: 256,
      repeat_penalty: 1.18,
      stop: ["</s>", "llama:", "User:"],
      temperature: 0.7,
      tfs_z: 1,
      top_k: 40,
      top_p: 0.5,
      typical_p: 1,
    });

    try {
      let res = await fetch("https://llama.app.cloud.cbh.kth.se/completion", {
        method: "POST",
        body: body,
      });

      let data = await res.json();

      let content = data.content;

      setResponse(content);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3} direction="column">
      {loading ? (
        <Skeleton variant="rectangular" width={"80%"} height={100} />
      ) : (
        <>
          {!response ? (
            <Typography variant="body2">
              <b>{t("resource-kubernetes-deployment")}</b>
              <br />
              {t("explain-deployment")}
              <br />
              <br />
              <b>VM ({t("resource-vm")})</b>
              <br />
              {t("explain-vm")}
            </Typography>
          ) : (
            <Stack direction="column">
              <Typography variant="body2">
                <b>🦙 Llama:</b>
                <br />
              </Typography>

              <GenAITooltip>{response}</GenAITooltip>
            </Stack>
          )}
        </>
      )}

      <Typography variant="body2" mb={0}></Typography>

      <Stack
        spacing={3}
        direction="row"
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        justifyContent="space-between"
      >
        <TextField
          label={t("llama-label")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => askLlama(input)} size="large">
                  <Iconify icon="material-symbols:send" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          variant="outlined"
          value={input}
          placeholder={lastInput}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              askLlama(e.target.value);
              setInput("");
            }
          }}
          fullWidth
          sx={{ maxWidth: 600 }}
        />

        <ResourceComparisonTable />
      </Stack>
    </Stack>
  );
};
export default ResourceTypeChat;
