import { Theme } from "@mui/material";

export interface CustomTheme extends Theme {
  customShadows: {
    z20: string;
  };
}
