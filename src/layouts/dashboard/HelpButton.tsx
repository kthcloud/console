import { IconButton, Link, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconify from "../../components/Iconify";

const resolveURL = () => {
  const path = window.location.href.replace(window.location.origin, "");

  const base_url = "https://docs.cloud.cbh.kth.se";
  if (
    path.startsWith("/create?type=deployment") ||
    path.startsWith("/edit/deployment/")
  )
    return base_url + "/usage/deployments";
  if (path.startsWith("/create?type=vm") || path.startsWith("/edit/vm/"))
    return base_url + "/usage/virtualMachines";

  if (path.startsWith("/profile")) return base_url + "/usage/profile";
  if (path.startsWith("/teams")) return base_url + "/usage/teams";
  if (path.startsWith("/inbox")) return base_url + "/usage/inbox";
  if (path.startsWith("/gpu")) return base_url + "/usage/gpu";

  return base_url;
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
