import { Button, IconButton, Tooltip } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
import Iconify from "./Iconify";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CopyButton = ({
  content,
  variant = "icon",
  textContent,
}: {
  content: string;
  variant?: string;
  textContent?: string;
}) => {
  const [tooltipLabel, setTooltipLabel] = useState("copy-to-clipboard");
  const [icon, setIcon] = useState<string>("ic:round-content-copy");
  const { t } = useTranslation();

  const handleCopy = () => {
    setIcon("ic:round-check");
    setTooltipLabel("copied");
    setTimeout(() => {
      setIcon("ic:round-content-copy");
      setTooltipLabel("copy-to-clipboard");
    }, 2000);
  };

  return (
    <CopyToClipboard text={content} onCopy={handleCopy}>
      <Tooltip enterTouchDelay={10} title={t(tooltipLabel)}>
        {variant === "icon" ? (
          <IconButton>
            <Iconify icon={icon} width={24} height={24} />
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
            startIcon={<Iconify icon={icon} />}
          >
            {textContent ? textContent : t("copy")}
          </Button>
        )}
      </Tooltip>
    </CopyToClipboard>
  );
};

export default CopyButton;
