import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "src/components/Iconify";

const HelpButton = () => {
  const { t, i18n } = useTranslation();
  const [icon, setIcon] = useState("emojione-v1:flag-for-sweden");
  return (
    <Tooltip title={t("button-change-language")}>
      <IconButton
        onClick={() => {
          if (i18n.language === "se") {
            i18n.changeLanguage("en");
            setIcon("emojione-v1:flag-for-sweden");
          } else {
            i18n.changeLanguage("se");
            setIcon("emojione-v1:flag-for-united-states");
          }
        }}
        sx={{ width: 40, height: 40 }}
      >
        <Iconify icon={icon} width={20} height={20} />
      </IconButton>
    </Tooltip>
  );
};

export default HelpButton;
