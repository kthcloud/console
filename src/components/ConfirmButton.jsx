import { useState } from "react";
import { useTranslation } from "react-i18next";

const {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Backdrop,
} = require("@mui/material");

const ConfirmButton = ({ action, actionText, callback, props }) => {
  const { t } = useTranslation();
  const [open, _setOpen] = useState(false);
  const setOpen = (state) => {
    if (state) navigator.vibrate?.([0.1, 5, 0.1]);
    _setOpen(state);
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            sx: {
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(3px)",
            },
          },
        }}
      >
        <DialogTitle>Confirm {action}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`${t("are-you-sure-you-want-to")} ${actionText}? ${t(
              "this-action-cannot-be-undone"
            )}`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setOpen(false)}>
            {t("cancel")}
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
