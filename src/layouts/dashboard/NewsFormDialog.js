// keycloak
import { useKeycloak } from '@react-keycloak/web';
// @mui
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { useState } from 'react';
import Iconify from '../../components/Iconify';
import useAlert from 'src/hooks/useAlert';

async function createNews(title, content, image, token) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', content);
    formData.append('image', image);

    return fetch('https://api.landing.kthcloud.com/news', {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => {
        if (response.ok) {
            return response.json()
        }
        throw response
    }).catch(error => {
        console.error('Error:', error);
        throw error
    });
}

export default function NewsFormDialog() {
    const { keycloak } = useKeycloak()

    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [image, setImage] = useState("")

    const { setAlert } = useAlert();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button size="large" color="inherit" endIcon={<Iconify icon={'eva:plus-outline'} />} onClick={handleClickOpen} />

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
                        onChange={e => {
                            setTitle(e.target.value)
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
                        onChange={e => {
                            setContent(e.target.value)
                        }}
                    />

                </DialogContent>

                <DialogContent>
                    <Grid container justifyContent="center">
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload File
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                hidden
                                onChange={e => {
                                    if (e.target.files.length > 0) {
                                        setImage(e.target.files[0])
                                    }
                                }}
                            />
                        </Button>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        createNews(title, content, image, keycloak.token)
                            .then(_result => {
                                setAlert('Sucessfully created news', 'success')
                            })
                            .catch(err => {
                                if (err.status === 400) {
                                    setAlert('Failed to create news: invalid input', 'error')
                                } else {
                                    setAlert('Failed to create news. ', 'error')
                                }
                            })

                        setTitle('')
                        setContent('')
                        handleClose()
                    }}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}