import PropTypes from "prop-types";
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
import { ThemeModeContext } from "src/contexts/ThemeModeContext";

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  const { mode } = useContext(ThemeModeContext);

  let shadows = makeShadows(mode);
  let customShadows = makeCustomShadows(mode);

  const getDesignTokens = (mode) => ({
    palette: mode === "light" ? lightPalette : palette,
    shape: { borderRadius: 8 },
    typography,
    shadows,
    customShadows,
  });

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

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
