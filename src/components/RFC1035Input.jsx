import { Stack, TextField, Typography } from "@mui/material";
import { sentenceCase } from "change-case";
import { useState } from "react";

export default function RFC1035Input({
  label,
  callToAction = "",
  type="Fields",
  fullWidth = true,
  autofocus = false,
  variant = "standard",
  cleaned,
  setCleaned,
}) {
  const [value, setValue] = useState("");

  const clean = (val) => {
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

  return (
    <Stack spacing={3} useFlexGap={true}>
      <TextField
        autoFocus={autofocus}
        fullWidth={fullWidth}
        margin="dense"
        id={label}
        label={label}
        variant={variant}
        value={cleaned && value}
        helperText={
          <span>
            {type} must follow{" "}
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
          setValue(e.target.value);
          clean(e.target.value);
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
