import { useContext, useMemo } from "react";
// material
import { CssBaseline } from "@mui/material";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material/styles";
//
import { palette, lightPalette } from "./palette";
import typography from "./typography";
import componentsOverride from "./overrides";
import { makeCustomShadows, makeShadows } from "./shadows";
import { ThemeModeContext } from "../contexts/ThemeModeContext";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useContext(ThemeModeContext);

  const shadows = makeShadows(mode);
  const customShadows = makeCustomShadows(mode);

  const getDesignTokens = (mode: string): any => ({
    palette: mode === "light" ? lightPalette : palette,
    shape: { borderRadius: 8 },
    typography,
    shadows,
    customShadows,
  });

  const theme = useMemo(
    () => createTheme(getDesignTokens(mode)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
