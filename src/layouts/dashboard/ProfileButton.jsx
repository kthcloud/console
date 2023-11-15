import { useEffect, useState } from "react";
import useResource from "src/hooks/useResource";
import { MD5 } from "crypto-js";
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import Iconify from "src/components/Iconify";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProfileButton = () => {
  const { user, notifications } = useResource();
  const [userAvatar, setUserAvatar] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { t } = useTranslation();

  const gravatar = async () => {
    const cleaned = user.email.trim().toLowerCase();
    const hash = MD5(cleaned, { encoding: "binary" }).toString();

    const uri = encodeURI(`https://www.gravatar.com/avatar/${hash}?d=404`);

    const response = await fetch(uri);
    if (response.status === 200) {
      return uri;
    }
    return null;
  };

  const fetchProfilePic = async () => {
    const gravatarUri = await gravatar();
    setHasFetched(true);
    if (gravatarUri) {
      setUserAvatar(gravatarUri);
      return;
    }
  };

  useEffect(() => {
    if (!(user && user.email && !hasFetched)) return;
    fetchProfilePic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Tooltip
      enterTouchDelay={10}
      title={
        <Stack spacing={1} alignItems={"flex-start"}>
          <Button
            startIcon={<Iconify icon="mdi:user-circle" />}
            color="inherit"
            component={Link}
            to="/profile"
          >
            {t("menu-profile")}
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:inbox" />}
            color="inherit"
            component={Link}
            to="/inbox"
          >
            {`${t("inbox")} (${notifications?.length})`}
          </Button>
        </Stack>
      }
    >
      <Badge
        invisible={notifications?.length === 0}
        badgeContent={notifications.length}
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
          {user && userAvatar ? (
            <Avatar sx={{ width: 20, height: 20 }} src={userAvatar} />
          ) : (
            <Iconify icon="mdi:user-circle" title="Profile" />
          )}
        </IconButton>
      </Badge>
    </Tooltip>
  );
};

export default ProfileButton;
