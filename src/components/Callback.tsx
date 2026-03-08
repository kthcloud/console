import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import Page from "./Page";

export default function Callback() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // Clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, document.title, url.pathname);

        // Redirect to /deploy
        navigate("/deploy", { replace: true });
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  if (auth.isLoading) {
    return (
      <Page>
        <Box component="div" sx={{ minHeight: "100vh" }}>
          <CircularProgress />
          <Typography mt={2} variant="h6">
            Authenticating...
          </Typography>
        </Box>
      </Page>
    );
  }

  if (auth.error) {
    return (
      <Page>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Paper
            elevation={3}
            sx={{ padding: 4, textAlign: "center", maxWidth: 400 }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Failed
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
              {auth.error?.message || "Unknown error occurred during login."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => auth.signinRedirect()}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      </Page>
    );
  }

  return null;
}
