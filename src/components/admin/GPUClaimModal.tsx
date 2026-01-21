import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import GpuClaimEditor from "./GPUClaimEditor";
import { GpuClaimCreate } from "../../temporaryTypesRemoveMe";
import Iconify from "../Iconify";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  zone: string;
  roles: string[];
  initialValue?: GpuClaimCreate;
  onClose: () => void;
  onSubmit: (value: GpuClaimCreate) => void;
}

type Role =
  | "default"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "admin"
  | string;

function getChipColor(role: Role) {
  const metalStyles: Record<string, any> = {
    bronze: {
      background:
        "linear-gradient(145deg, #cd7f32 0%, #b06a2f 50%, #d99c6c 100%)",
      color: "#000",
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)",
    },
    silver: {
      background:
        "linear-gradient(145deg, #e6e8eb 0%, #c0c0c0 50%, #f5f5f5 100%)",
      color: "#000",
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)",
    },
    gold: {
      background:
        "linear-gradient(145deg, #ffd700 0%, #e6c200 50%, #ffea70 100%)",
      color: "#000",
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4)",
    },
    platinum: {
      background:
        "linear-gradient(145deg, #e5e4e2 0%, #cfcfcf 50%, #ffffff 100%)",
      color: "#000",
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)",
    },
  };

  const muiColors: Record<
    string,
    | "default"
    | "error"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
  > = {
    default: "default",
    admin: "error",
  };

  if (metalStyles[role]) {
    return {
      sx: {
        background: metalStyles[role].background,
        color: metalStyles[role].color,
        boxShadow: metalStyles[role].boxShadow,
      },
    };
  }

  return { color: muiColors[role] ?? "default" };
}

export default function GpuClaimModal({
  open,
  zone,
  roles,
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState<GpuClaimCreate>(
    initialValue ?? {
      name: "",
      zone,
      allowedRoles: [],
      requested: [],
    }
  );
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialValue ? "Edit GPU Claim" : "Create GPU Claim"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Claim name"
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
            required
          />

          <TextField label="Zone" value={zone} disabled />

          <Autocomplete
            multiple
            freeSolo
            options={roles}
            value={value.allowedRoles ?? []}
            onChange={(_, roles) =>
              setValue({
                ...value,
                allowedRoles: Array.isArray(roles) ? roles : [roles],
              })
            }
            renderTags={(r, getTagProps) =>
              r.map((role, index) => (
                <Chip
                  {...getTagProps({ index })}
                  label={role}
                  {...getChipColor(role)}
                />
              ))
            }
            renderInput={(params) => (
              <Stack alignItems={"flex-end"}>
                <Tooltip
                  enterTouchDelay={10}
                  title={
                    <>
                      <Typography variant="caption">
                        {"These roles will be allowed to use the GPUClaim."}
                      </Typography>
                      <br></br>
                      <Typography variant="caption">
                        {"If left empty, anyone will be allowed to use it."}
                      </Typography>
                      <br></br>
                      <Typography variant="caption">
                        {
                          'The admin "role" will make sure that only users that are admin can use it.'
                        }
                      </Typography>
                    </>
                  }
                >
                  <span>
                    <Iconify
                      icon="mdi:help-circle-outline"
                      color={theme.palette.info.main}
                    />
                  </span>
                </Tooltip>
                <TextField {...params} label="Allowed roles" />
              </Stack>
            )}
          />

          <GpuClaimEditor
            value={value.requested ?? []}
            onChange={(requested) => setValue({ ...value, requested })}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!value.requested?.length}
          onClick={() => onSubmit(value)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
