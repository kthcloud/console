// @mui
import {
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useState } from "react";
import Iconify from "../../components/Iconify";

export default function NewsFormDialog({ onCreate }) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <Iconify icon={"eva:plus-outline"} />
      </IconButton>

      <Dialog fullWidth maxWidth={"md"} open={open} onClose={handleClose}>
        <DialogTitle>Add</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="title"
            label="Title"
            variant="standard"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </DialogContent>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            minRows={4}
            autoFocus
            margin="dense"
            id="content"
            label="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
        </DialogContent>

        <DialogContent>
          <Grid container justifyContent="center">
            <Button variant="contained" component="label">
              Upload File
              <input
                type="file"
                accept="image/png, image/jpeg"
                hidden
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setImage(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              onCreate(title, content, image)
                .then(() => {
                  setTitle("");
                  setContent("");
                })
                .catch(() => {})
                .finally(() => {
                  handleClose();
                });
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
