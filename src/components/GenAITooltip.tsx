import { Box, Tooltip, Typography } from "@mui/material";
import Iconify from "./Iconify";
import { useTranslation } from "react-i18next";

// Wrap child components in params with a tooltip. Add a twinkle emoji to the end of the child, which activates the tooltip.
export const GenAITooltip = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();

  return (
    <Box>
      {children}
      <Tooltip enterTouchDelay={10} title={t("this-content-is-ai-generated")}>
        <Typography variant="caption" sx={{ m: 1 }}>
          <Iconify icon="twemoji:sparkles" />
        </Typography>
      </Tooltip>
    </Box>
  );
};
