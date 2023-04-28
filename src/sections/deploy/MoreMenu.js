import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
// material
// component
import Iconify from "../../components/Iconify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useAlert from "src/hooks/useAlert";

// ----------------------------------------------------------------------

export default function MoreMenu({ row }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { keycloak, initialized } = useKeycloak();
  const [textAreaValue, setTextAreaValue] = useState(null);
  const { setAlert } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDeploymentYaml = () => {
    if (!initialized) return;
    if (textAreaValue) return;
    fetch(
      process.env.REACT_APP_DEPLOY_API_URL +
        "/deployments/" +
        row.id +
        "/ciConfig",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + keycloak.token,
        },
      }
    )
      .then((response) => response.json())
      .then((result) => {
        setTextAreaValue(result.config);
      })
      .catch((error) => {
        console.error("Error fetching deployment yaml:", error);
      });
  };

  const deleteResource = () => {
    if (!initialized) return;
    fetch(
      process.env.REACT_APP_DEPLOY_API_URL + "/" + row.type + "s/" + row.id,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + keycloak.token,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw res;
      })
      .catch((err) => {
        setAlert("Could not delete resource " + JSON.stringify(err), "error");
      });
    setIsOpen(false);
  };

  const attachGPU = (vm) => {
    if (!initialized) return;
    fetch(
      process.env.REACT_APP_DEPLOY_API_URL +
        "/" +
        row.type +
        "s/" +
        row.id +
        (!vm.gpu ? "/attachGpu" : "/detachGpu"),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + keycloak.token,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw res;
        else setAlert(!vm.gpu ? "Attaching GPU..." : "Detaching GPU...", "success");
      })
      .catch((err) => {
        setAlert(!vm.gpu ? "Could not attach GPU " : "Could not detach GPU " + JSON.stringify(err), "error");
      });
    setIsOpen(false);
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <>
        {/* Modals */}

        <Dialog
          fullWidth
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        >
          <DialogTitle>
            {(row.type === "deployment" && "GitHub Actions YAML") ||
              (row.type === "vm" && "SSH Command")}
          </DialogTitle>
          <DialogContent>
            <TextareaAutosize
              value={textAreaValue ? textAreaValue : "Loading..."}
              style={{ width: "100%", border: 0 }}
            />
          </DialogContent>

          <DialogActions>
            <CopyToClipboard
              text={textAreaValue}
              onCopy={() => setModalOpen(false)}
            >
              <Button>Copy to clipboard</Button>
            </CopyToClipboard>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          sx={{ color: "text.secondary" }}
          onClick={deleteResource}
          disabled={row.status !== "resourceRunning"}
        >
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>

        {row.type === "vm" && (
          <MenuItem
            component={RouterLink}
            to="#"
            sx={{ color: "text.secondary" }}
            disabled={row.status !== "resourceRunning"}
            onClick={() => attachGPU(row)}
          >
            <ListItemIcon>
              <Iconify icon="bi:gpu-card" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary={!row.gpu ? "Attach GPU" : "Detach GPU"}
              primaryTypographyProps={{ variant: "body2" }}
            />
          </MenuItem>
        )}

        {row.type === "vm" && (
          <MenuItem
            component={RouterLink}
            to="#"
            sx={{ color: "text.secondary" }}
            onClick={() => {
              setTextAreaValue(row.connectionString);
              setIsOpen(false);
              setModalOpen(true);
            }}
            disabled={row.status !== "resourceRunning"}
          >
            <ListItemIcon>
              <Iconify icon="mdi:ssh" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary="View SSH command"
              primaryTypographyProps={{ variant: "body2" }}
            />
          </MenuItem>
        )}

        {row.type === "deployment" && (
          <MenuItem
            component={RouterLink}
            to="#"
            sx={{ color: "text.secondary" }}
            onClick={() => {
              fetchDeploymentYaml();
              setIsOpen(false);
              setModalOpen(true);
            }}
            disabled={row.status !== "resourceRunning"}
          >
            <ListItemIcon>
              <Iconify icon="mdi:github" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary="View GitHub Actions file"
              primaryTypographyProps={{ variant: "body2" }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
