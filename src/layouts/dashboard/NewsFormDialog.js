// keycloak
import { useKeycloak } from '@react-keycloak/web';
// @mui
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import Iconify from '../../components/Iconify';
import useAlert from 'src/hooks/useAlert';

async function createForm(title, content, image, token) {
    const body = {
        title: title,
        description: content,
        image: image
    }

    return fetch('https://api.landing.kthcloud.com/news', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
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
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        createForm(title, content, 'none', keycloak.token)
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