import { Stack, TextField, IconButton, Chip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

// Simple CEL validation function (stub, replace with real parser)
const validateCel = (expr: string): boolean => {
  try {
    if (!expr) return true; // empty allowed
    // TODO: Replace with actual CEL parser/validation
    // For now: basic check for balanced parentheses
    let count = 0;
    for (const c of expr) {
      if (c === "(") count++;
      if (c === ")") count--;
      if (count < 0) return false;
    }
    return count === 0;
  } catch {
    return false;
  }
};

interface CelExprBuilderProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
}

export default function CelExprBuilder({
  value,
  onChange,
  label = "CEL Expressions",
  placeholder = "Enter CEL expression",
}: CelExprBuilderProps) {
  const [input, setInput] = useState("");

  const addExpr = () => {
    const expr = input.trim();
    if (!expr) return;

    const newValue = [...value, expr];
    onChange(newValue);
    setInput("");
  };

  const removeExpr = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>

      {/* Existing expressions as Chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {value.map((expr, idx) => {
          const valid = validateCel(expr);
          return (
            <Chip
              key={idx}
              label={expr}
              color={valid ? "primary" : "error"}
              onDelete={() => removeExpr(idx)}
            />
          );
        })}
      </Stack>

      {/* Input field for new expression */}
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          error={(input && !validateCel(input)) || false}
          helperText={input && !validateCel(input) ? "Invalid CEL syntax" : ""}
        />
        <IconButton
          color="primary"
          onClick={addExpr}
          disabled={!input || !validateCel(input)}
        >
          <AddIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
