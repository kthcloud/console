// @mui
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import Iconify from "../../components/Iconify";

export default function CreateDeployment({ onCreate }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      createDeployment();
    }
  };

  const createDeployment = () => {
    onCreate(name, content)
      .then(() => {
        setName("");
        setContent("");
      })
      .catch(() => {})
      .finally(() => {
        handleClose();
      });
  };

  return (
    <div>
      <Button
        onClick={handleClickOpen}
        variant="contained"
        to="#"
        startIcon={<Iconify icon="eva:plus-fill" />}
        sx={{ mr: 3 }}
      >
        New Deployment
      </Button>

      <Dialog fullWidth maxWidth={"md"} open={open} onClose={handleClose}>
        <DialogTitle>Create Deployment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="deploymentName"
            label="Name"
            variant="standard"
            value={name}
            error={
              !/^[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?([a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(
                name
              )
            }
            helperText={
              <span>
                Deployment names must follow{" "}
                <a
                  href="https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names"
                  target="_blank"
                  rel="noreferrer"
                >
                  RFC 1035
                </a>{" "}
                and must not include dots.
              </span>
            }
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={handleKeyPress}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={createDeployment}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}