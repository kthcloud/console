import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "src/components/Iconify";

const HelpButton = () => {
  const { t, i18n } = useTranslation();
  const [icon, setIcon] = useState("");

  useEffect(
    () => {
      if (i18n.language === "se") {
        setIcon("emojione-v1:flag-for-united-states");
      } else {
        setIcon("emojione-v1:flag-for-sweden");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  );

  return (
    <Tooltip title={t("button-change-language")}>
      <IconButton
        onClick={() => {
          if (i18n.language === "se") {
            i18n.changeLanguage("en");
          } else {
            i18n.changeLanguage("se");
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
