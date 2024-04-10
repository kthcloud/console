import { Color, Palette, Theme } from "@mui/material";

export interface CustomColor extends Color {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  500_8: string;
  500_12: string;
  500_16: string;
  500_24: string;
  500_32: string;
  500_48: string;
  500_56: string;
  500_80: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100: string;
  A200: string;
  A400: string;
  A700: string;
}

type ColorArray = [string, string, string, string];

type ChartColors = {
  [K in "violet" | "blue" | "green" | "yellow" | "red"]: ColorArray;
};

export interface CustomPalette extends Palette {
  grey: CustomColor;
  chart: ChartColors;
}

export interface CustomTheme extends Theme {
  customShadows: {
    z20: string;
    z24: string;
  };
  palette: CustomPalette;
}

export type ThemeColor =
  | "error"
  | "warning"
  | "info"
  | "success"
  | "primary"
  | "secondary"
  | undefined;
