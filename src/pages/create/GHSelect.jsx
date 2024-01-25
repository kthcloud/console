import {
  Card,
  CardContent,
  CardHeader,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { getRepositories } from "/src/api/deploy/github";
import Iconify from "/src/components/Iconify";
import { errorHandler } from "/src/utils/errorHandler";

export const GHSelect = ({ setAccessToken, repo, setRepo }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();

  // eslint-disable-next-line no-unused-vars
  let [searchParams, _] = useSearchParams();

  // PROD
  let client_id = "6c3a489177c7833cc639";

  if (window.location.href.includes("localhost")) {
    // DEV
    client_id = "12ec7f8b9a291a4817c6";
  }

  const getRepos = async (newCode) => {
    if (!newCode) return;
    if (code) return;
    setLoading(true);
    try {
      const res = await getRepositories(newCode, keycloak.token);
      setAccessToken(res.accessToken);
      setRepos(res.repositories);
      setLoading(false);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("error-getting-repos") + ": " + e, {
          variant: "error",
        })
      );
    }
  };

  useEffect(() => {
    // After requesting Github access, Github redirects back to your app with a code parameter
    const hasCode = searchParams.has("code");

    // If Github API returns the code parameter
    if (hasCode) {
      const newUrl = searchParams.get("code");
      setCode(newUrl);
      getRepos(newUrl);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("create-deployment-github-title")}
        subheader={t("create-deployment-github-subheader")}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {repos.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel id="repo-picker-label">
                  {t("create-deployment-github-repo")}
                </InputLabel>
                <Select
                  labelId="repo-picker-label"
                  id="repo-picker"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  label={t("create-deployment-github-repo")}
                  fullWidth
                  defaultOpen
                >
                  {repos.map((repo, index) => (
                    <MenuItem
                      key={repo.id}
                      value={repo.id}
                      sx={() => {
                        if (index % 2 === 0) return { backgroundColor: "#eee" };
                      }}
                    >
                      <span>{repo.name}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Button
                className="login-link"
                href={`https://github.com/login/oauth/authorize?scope=user%20admin:repo_hook&client_id=${client_id}`}
                startIcon={<Iconify icon="mdi:github" />}
                variant="contained"
              >
                <span>{t("login-with-github")}</span>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
