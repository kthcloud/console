import React from "react";
import { useAuth } from "react-oidc-context";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function TokenExpiryModal() {
  const auth = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    return auth.events.addAccessTokenExpiring(() => {
      setOpen(true);
    });
  }, [auth.events]);

  const handleContinue = async () => {
    try {
      await auth.signinSilent();
      setOpen(false);
    } catch (err) {
      // notistack insted
      console.error("Silent renew failed", err);
    }
  };

  const handleLogout = () => {
    auth.removeUser();
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Session Expiring</DialogTitle>

      <DialogContent>
        <Typography>
          Your session is about to expire due to inactivity. Would you like to
          stay signed in?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleLogout} color="error">
          Log out
        </Button>

        <Button onClick={handleContinue} variant="contained">
          Continue session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
