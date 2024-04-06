import useResource from "../../hooks/useResource";
import {
  Badge,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from "@mui/material";
import Iconify from "../../components/Iconify";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Gravatar from "../../components/Gravatar";

const ProfileButton = () => {
  const { user, unread } = useResource();
  const { t } = useTranslation();

  return (
    <Tooltip
      enterTouchDelay={10}
      title={
        <MenuList>
          <MenuItem component={Link} to="/profile">
            <ListItemIcon>
              <Iconify icon="mdi:user-circle" />
            </ListItemIcon>
            <ListItemText>{t("menu-profile")}</ListItemText>
          </MenuItem>

          <MenuItem component={Link} to="/inbox">
            <ListItemIcon>
              <Iconify icon="material-symbols:inbox" />
            </ListItemIcon>
            <ListItemText>{`${t("inbox")} (${unread})`}</ListItemText>
          </MenuItem>

          <MenuItem component={Link} to="/teams">
            <ListItemIcon>
              <Iconify icon="mdi:account-group" />
            </ListItemIcon>
            <ListItemText>{t("teams")}</ListItemText>
          </MenuItem>
        </MenuList>
      }
    >
      <Badge
        invisible={unread === 0}
        badgeContent={unread}
        color="primary"
        sx={{
          display: {
            xs: "none",
            sm: "none",
            md: "inline-flex",
          },
        }}
      >
        <IconButton
          component={Link}
          to="/profile"
          sx={{
            width: 40,
            height: 40,
            display: {
              xs: "none",
              sm: "none",
              md: "inline-flex",
            },
          }}
        >
          <Gravatar
            user={user}
            fallback={
              <Iconify
                icon="mdi:account"
                sx={{ width: 16, height: 16 }}
                title="Profile"
              />
            }
          />
        </IconButton>
      </Badge>
    </Tooltip>
  );
};

export default ProfileButton;
