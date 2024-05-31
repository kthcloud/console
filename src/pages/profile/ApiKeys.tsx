import {
  Backdrop,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TextareaAutosize,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconify from "../../components/Iconify";
import useResource from "../../hooks/useResource";
import { useState } from "react";
import { CustomTheme } from "../../theme/types";
import { createApiKey, updateUser } from "../../api/deploy/users";
import { errorHandler } from "../../utils/errorHandler";
import { enqueueSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";
import { ApiKeyCreated } from "@kthcloud/go-deploy-types/types/v2/body";
import CopyButton from "../../components/CopyButton";

export const ApiKeys = () => {
  const { t } = useTranslation();
  const { user } = useResource();
  const theme: CustomTheme = useTheme();
  const { keycloak, initialized } = useKeycloak();

  const dateOptions = ["7 days", "30 days", "90 days", "1 year"];

  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyExpires, setNewKeyExpires] = useState<string>(dateOptions[0]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>("");
  const [loading, setLoading] = useState<string[]>([]);

  const createKey = async () => {
    if (!(user && initialized && keycloak.token)) {
      return;
    }

    // Calculate ISO date from selected option
    const newKeyExpiresDate = new Date();
    const option = newKeyExpires.split(" ");
    const amount = parseInt(option[0]);
    const unit = option[1];
    switch (unit) {
      case "days":
        newKeyExpiresDate.setDate(newKeyExpiresDate.getDate() + amount);
        break;
      case "year":
        newKeyExpiresDate.setFullYear(newKeyExpiresDate.getFullYear() + amount);
        break;
      default:
        break;
    }

    const isoDate = newKeyExpiresDate.toISOString();

    try {
      // Create the key
      const response: ApiKeyCreated = await createApiKey(
        keycloak.token,
        user.id,
        newKeyName,
        isoDate
      );

      if (response) {
        setNewKey(response.key);
        setNewKeyName("");
        setNewKeyExpires(dateOptions[0]);
        setDialogOpen(true);
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, {
          variant: "error",
        })
      );
    }
  };

  const deleteKey = async (keyName: string) => {
    if (!(user && initialized && keycloak.token)) {
      return;
    }
    setLoading([...loading, keyName]);

    try {
      const response = await updateUser(user.id, keycloak.token, {
        apiKeys: user.apiKeys.filter((k) => k.name !== keyName),
      });
      if (response) {
        enqueueSnackbar(t("successfully-updated"), {
          variant: "success",
        });
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, {
          variant: "error",
        })
      );
      setLoading(loading.filter((k) => k !== keyName));
    }
  };

  const renderExpireSpan = (option: string) => {
    const chunks = option.split(" ");
    return chunks[0] + " " + t(chunks[1]);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
        <DialogTitle>{t("your-new-key")}</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2}>
            <Typography>{t("only-once")}</Typography>
            <TextareaAutosize
              value={newKey ? newKey : t("loading")}
              style={{
                width: "100%",
                border: 0,
                color: theme.palette.grey[800],
                background: "black",
                padding: theme.spacing(1),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <CopyButton content={newKey} variant="text" />
          <Button onClick={() => setDialogOpen(false)} color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("api-keys")}
          subheader={
            <>
              <span>{t("api-keys-subheader")}</span>
              <Link
                href="https://docs.cloud.cbh.kth.se/usage/api/"
                target="_blank"
                rel="noreferrer"
                sx={{ ml: 1 }}
              >
                {t("learn-more")}
              </Link>
            </>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin-name")}</TableCell>
                  <TableCell>{t("expires")}</TableCell>
                  <TableCell align="right">{t("admin-actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.apiKeys
                  .filter((key) => key.name)
                  .map((key, index) => (
                    <TableRow
                      key={"key_" + key.name + "_" + index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      {!loading.includes(key.name) ? (
                        <>
                          <TableCell component="th" scope="row">
                            {key.name}
                          </TableCell>
                          <TableCell>
                            {
                              key.expiresAt
                                .replace("T", " ")
                                .replace("Z", "")
                                .split(".")[0]
                            }
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => deleteKey(key.name)}
                            >
                              <Iconify icon="mdi:delete" />
                            </IconButton>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={3}>
                          <Skeleton />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                <TableRow
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <TextField
                      label={t("admin-name")}
                      variant="outlined"
                      value={newKeyName}
                      onChange={(e) => {
                        setNewKeyName(e.target.value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newKeyExpires}
                      onChange={(e) => {
                        setNewKeyExpires(e.target.value);
                      }}
                      variant="outlined"
                      sx={{ minWidth: 130 }}
                    >
                      {dateOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {renderExpireSpan(option)}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      aria-label="upload key"
                      component="label"
                      disabled={!(newKeyName && newKeyExpires)}
                      onClick={createKey}
                    >
                      <Iconify icon="mdi:content-save" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};
