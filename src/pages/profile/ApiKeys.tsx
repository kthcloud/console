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
import { useKeycloak } from "../../hooks/useKeycloak";
import { ApiKeyCreated } from "@kthcloud/go-deploy-types/types/v2/body";
import CopyButton from "../../components/CopyButton";
import { NoWrapTable as Table } from "../../components/NoWrapTable";
export const ApiKeys = () => {
  const { t } = useTranslation();
  const { user, setUser } = useResource();
  const theme: CustomTheme = useTheme();
  const { keycloak, initialized } = useKeycloak();

  const dateOptions = ["7 days", "30 days", "90 days", "1 year"];

  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyExpires, setNewKeyExpires] = useState<string>(dateOptions[0]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>("");
  const [loading, setLoading] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const now = new Date();

  if (!user) return null;

  const activeKeys = user.apiKeys.filter(
    (key) => key.expiresAt && new Date(key.expiresAt) > now
  );
  const expiredKeys = user.apiKeys.filter(
    (key) => key.expiresAt && new Date(key.expiresAt) <= now
  );

  const createKey = async () => {
    if (!(user && initialized && keycloak.token)) return;

    const newKeyExpiresDate = new Date();
    const [amountStr, unit] = newKeyExpires.split(" ");
    const amount = parseInt(amountStr);

    switch (unit) {
      case "days":
        newKeyExpiresDate.setDate(newKeyExpiresDate.getDate() + amount);
        break;
      case "year":
        newKeyExpiresDate.setFullYear(newKeyExpiresDate.getFullYear() + amount);
        break;
    }

    const isoDate = newKeyExpiresDate.toISOString();

    try {
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
        enqueueSnackbar(t("could-not-fetch-profile") + e, { variant: "error" })
      );
    }
  };

  const deleteKey = async (keyName: string) => {
    if (!(user && initialized && keycloak.token)) return;

    setLoading([...loading, keyName]);
    try {
      await updateUser(user.id, keycloak.token, {
        apiKeys: user.apiKeys.filter((k) => k.name !== keyName),
      });
      enqueueSnackbar(t("successfully-updated"), { variant: "success" });
      setUser({
        ...user,
        apiKeys: user.apiKeys.filter((k) => k.name !== keyName),
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, { variant: "error" })
      );
    } finally {
      setLoading(loading.filter((k) => k !== keyName));
    }
  };

  const deleteExpired = async () => {
    if (!(user && initialized && keycloak.token)) return;
    setBulkLoading(true);
    const expiredNames = expiredKeys.map((k) => k.name);
    try {
      await updateUser(user.id, keycloak.token, {
        apiKeys: user.apiKeys.filter((k) => !expiredNames.includes(k.name)),
      });
      enqueueSnackbar(t("successfully-updated"), { variant: "success" });
      setUser({
        ...user,
        apiKeys: user.apiKeys.filter((k) => !expiredNames.includes(k.name)),
      });
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-fetch-profile") + e, { variant: "error" })
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const renderExpireSpan = (option: string) => {
    const chunks = option.split(" ");
    return chunks[0] + " " + t(chunks[1]);
  };

  const renderKeyRow = (key: (typeof user.apiKeys)[0]) => (
    <TableRow
      key={key.name}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      {!loading.includes(key.name) ? (
        <>
          <TableCell component="th" scope="row">
            {key.name}
          </TableCell>
          <TableCell>
            {key.expiresAt?.replace("T", " ").replace("Z", "").split(".")[0]}
          </TableCell>
          <TableCell align="right">
            <IconButton color="error" onClick={() => deleteKey(key.name)}>
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
  );

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            sx: { background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" },
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
          <Stack spacing={4}>
            <Typography variant="h6">{t("active-keys")}</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("admin-name")}</TableCell>
                    <TableCell>{t("expires")}</TableCell>
                    <TableCell align="right">{t("admin-actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeKeys.length > 0 ? (
                    activeKeys.map(renderKeyRow)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        {t("nothing-to-see-here")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {expiredKeys.length > 0 && (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography variant="h6">{t("expired-keys")}</Typography>
                  {expiredKeys.length > 0 && (
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={deleteExpired}
                      disabled={bulkLoading}
                    >
                      {t("delete-all-expired")}
                    </Button>
                  )}
                </Stack>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("expires")}</TableCell>
                        <TableCell align="right">
                          {t("admin-actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{expiredKeys.map(renderKeyRow)}</TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <TextField
                        label={t("admin-name")}
                        variant="outlined"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newKeyExpires}
                        onChange={(e) => setNewKeyExpires(e.target.value)}
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
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};
