import { Button, IconButton, Tooltip } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "./Iconify";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CopyButton = ({
  content,
  variant = "icon",
}: {
  content: string;
  variant?: string;
}) => {
  const [tooltipLabel, setTooltipLabel] = useState("copy-to-clipboard");
  const { t } = useTranslation();

  const handleCopy = () => {
    setTooltipLabel("copied");
    setTimeout(() => {
      setTooltipLabel("copy-to-clipboard");
    }, 2000);
  };

  return (
    <CopyToClipboard text={content} onCopy={handleCopy}>
      <Tooltip enterTouchDelay={10} title={t(tooltipLabel)}>
        {variant === "icon" ? (
          <IconButton>
            <Iconify icon={"ic:round-content-copy"} width={24} height={24} />
          </IconButton>
        ) : (
          <Button
            variant={
              variant === "text" ||
              variant === "outlined" ||
              variant === "contained"
                ? variant
                : "text"
            }
            startIcon={
              <Iconify icon={"material-symbols:content-copy-outline"} />
            }
          >
            {t("copy")}
          </Button>
        )}
      </Tooltip>
    </CopyToClipboard>
  );
};

export default CopyButton;
