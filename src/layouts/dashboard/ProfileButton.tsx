import useResource from "../../hooks/useResource";
import {
  Avatar,
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

const ProfileButton = () => {
  const { user, unread } = useResource();
  const { t } = useTranslation();

  if (!user) return null;

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
          {user.gravatarUrl ? (
            <Avatar src={user.gravatarUrl} sx={{ width: 20, height: 20 }} />
          ) : (
            <Avatar sx={{ width: 20, height: 20 }}>
              <Iconify
                icon="mdi:account"
                sx={{ width: 16, height: 16 }}
                title="Profile"
              />
            </Avatar>
          )}
        </IconButton>
      </Badge>
    </Tooltip>
  );
};

export default ProfileButton;
