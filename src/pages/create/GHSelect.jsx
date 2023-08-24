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
import { getRepositories } from "src/api/deploy/github";
import Iconify from "src/components/Iconify";

export const GHSelect = ({ setAccessToken, repo, setRepo }) => {
  const [code, setCode] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { initialized, keycloak } = useKeycloak();

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
    } catch (e) {
      enqueueSnackbar("Error getting repositories " + JSON.stringify(e), {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    // After requesting Github access, Github redirects back to your app with a code parameter
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    // If Github API returns the code parameter
    if (hasCode) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, null, newUrl[0]);
      setCode(newUrl[1]);

      getRepos(newUrl[1]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={"Connect GitHub repository"}
        subheader="Link your GitHub repo for automatic Continuous Delivery. If not linked, instructions for pushing your container image will be provided."
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {repos.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel id="repo-picker-label">Repositories</InputLabel>
                <Select
                  labelId="repo-picker-label"
                  id="repo-picker"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  label="Repositories"
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
                <span>Login with GitHub</span>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
