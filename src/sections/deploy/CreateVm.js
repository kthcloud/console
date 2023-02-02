// @mui
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { useState } from "react";
import Iconify from "../../components/Iconify";

export default function CreateVm({ onCreate }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [cleaned, setCleaned] = useState("");
  const [content, setContent] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      createVm();
    }
  };
  const createVm = () => {
    onCreate(cleaned, content)
      .then(() => {
        handleClose();
      })
      .catch(() => {})
      .finally(() => {
        setName("");
        setContent("");
        setCleaned("");
      });
  };

  const clean = (name) => {
    name = name.toLowerCase();
    // convert name to RFC 1035
    name = name.replace(/[^a-z0-9-]/g, "-");
    name = name.replace(/-+/g, "-");
    name = name.replace(/^-|-$/g, "");
    // trim to 30 characters
    name = name.substring(0, 30);
    // convert name to RFC 1035
    name = name.replace(/[^a-z0-9-]/g, "-");
    name = name.replace(/-+/g, "-");
    name = name.replace(/^-|-$/g, "");

    setCleaned(name);
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
        New VM
      </Button>

      <Dialog fullWidth maxWidth={"md"} open={open} onClose={handleClose}>
        <DialogTitle>Create VM</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="vmName"
            label="Name"
            variant="standard"
            value={name}
            error={
              !/^[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?([a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$|^.{0}$/.test(
                cleaned
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
              clean(e.target.value);
            }}
            onKeyDown={handleKeyPress}
          />
          {cleaned !== "" && (
            <DialogContentText sx={{ mt: 3 }}>
              Your VM will be created with the name <strong>{cleaned}</strong>
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={createVm}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
