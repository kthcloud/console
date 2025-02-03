import { Box, styled } from "@mui/material";

const BlinkingLED = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: boolean }>(({ theme, status }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: status
    ? theme.palette.success.main
    : theme.palette.error.main,
  animation: status ? "blinkGreen 1s infinite" : "blinkRed 2s infinite",
  boxShadow: `0 0 1rem ${
    status ? theme.palette.success.main : theme.palette.error.main
  }`,

  "@keyframes blinkGreen": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.3 },
    "70%": { opacity: 0.9 },
    "100%": { opacity: 1 },
  },
  "@keyframes blinkRed": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.3 },
    "70%": { opacity: 0.9 },
    "100%": { opacity: 1 },
  },
}));

export default BlinkingLED;
