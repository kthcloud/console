import { IconButton, Link, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconify from "src/components/Iconify";

const resolveURL = () => {
  const path = window.location.href.replace(window.location.origin, "");

  const base_url = "https://wiki.cloud.cbh.kth.se/index.php/";
  if (path.startsWith("/deploy")) return base_url + "Main_Page";
  if (
    path.startsWith("/create?type=deployment") ||
    path.startsWith("/edit/deployment/")
  )
    return base_url + "Usage:Host_a_webapp_with_Deploy";
  if (path.startsWith("/create?type=vm") || path.startsWith("/edit/vm/"))
    return base_url + "Using_Virtual_Machines";

  if (path.startsWith("/profile")) return base_url + "Profile";
  if (path.startsWith("/teams")) return base_url + "Teams";
  if (path.startsWith("/inbox")) return base_url + "Inbox";

  return "https://wiki.cloud.cbh.kth.se";
};

const HelpButton = () => {
  const { t } = useTranslation();

  return (
    <Tooltip enterTouchDelay={10} title={t("button-help")}>
      <IconButton
        component={Link}
        target="_blank"
        rel="me"
        href={resolveURL()}
        sx={{ width: 40, height: 40 }}
      >
        <Iconify icon="material-symbols:help-outline" width={20} height={20} />
      </IconButton>
    </Tooltip>
  );
};

export default HelpButton;
