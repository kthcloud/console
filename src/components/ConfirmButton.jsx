import { useState } from "react";

const {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} = require("@mui/material");

const ConfirmButton = ({ action, actionText, callback, props }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm {action}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionText}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              callback();
            }}
            color="error"
          >
            {action}
          </Button>
        </DialogActions>
      </Dialog>

      <Button {...props} onClick={() => setOpen(true)}>
        {action}
      </Button>
    </>
  );
};

export default ConfirmButton;
