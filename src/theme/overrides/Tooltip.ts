// ----------------------------------------------------------------------

export default function Tooltip(theme) {
  let color = theme.palette.grey[200];
  if (theme.palette.mode === "light") {
    color = theme.palette.grey[800];
  }

  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: color,
        },
        arrow: {
          color: color,
        },
      },
    },
  };
}
