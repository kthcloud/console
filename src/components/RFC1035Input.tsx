import {
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { faker } from "@faker-js/faker";
import RandomizeButton from "./RandomizeButton";

export type RFC1035InputProps = {
  label: string;
  callToAction?: string;
  type?: string;
  fullWidth?: boolean;
  autofocus?: boolean;
  variant?: "standard" | "outlined" | "filled";
  cleaned: string;
  setCleaned: (val: string) => void;
  initialValue?: string;
  maxWidth?: string;
  enableRandomize?: boolean;
};

export default function RFC1035Input({
  label,
  callToAction = "",
  type = "Fields",
  fullWidth = true,
  autofocus = false,
  variant = "outlined",
  cleaned,
  setCleaned,
  initialValue = "",
  maxWidth = "100%",
  enableRandomize = false,
}: RFC1035InputProps) {
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setValue(initialValue);
    clean(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const clean = (val: string) => {
    // convert name to RFC 1035
    val = val.toLowerCase();
    val = val.replace(/[^a-z0-9-]/g, "-");
    val = val.replace(/-+/g, "-");
    val = val.replace(/^-|-$/g, "");
    // trim to 30 characters
    val = val.substring(0, 30);
    // convert name to RFC 1035 (again in case we end up with a trailing dash)
    val = val.replace(/[^a-z0-9-]/g, "-");
    val = val.replace(/-+/g, "-");
    val = val.replace(/^-|-$/g, "");

    setCleaned(val);
  };

  const randomizeName = () => {
    const newRandomName = faker.word
      .words(3)
      .replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "-");
    setValue(newRandomName);
    clean(newRandomName);
  };

  return (
    <Stack spacing={3} useFlexGap={true} sx={{ maxWidth: maxWidth }}>
      <TextField
        autoFocus={autofocus}
        fullWidth={fullWidth}
        margin="dense"
        id={label}
        label={label}
        variant={variant}
        value={cleaned && value}
        helperText={
          <Typography variant="caption">
            {type + t("rfc-1035-1")}
            <Link
              href="https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names"
              target="_blank"
              rel="noreferrer"
            >
              RFC 1035
            </Link>
            {t("rfc-1035-2")}
          </Typography>
        }
        onChange={(e) => {
          setValue(e.target.value);
          clean(e.target.value);
        }}
        InputProps={{
          endAdornment: enableRandomize ? (
            <InputAdornment position="end">
              <RandomizeButton onClick={randomizeName} size="large" />
            </InputAdornment>
          ) : null,
        }}
      />
      {cleaned && (
        <Typography>
          {callToAction + " "}
          <strong style={{ fontFamily: "monospace" }}>{cleaned}</strong>
        </Typography>
      )}
    </Stack>
  );
}
