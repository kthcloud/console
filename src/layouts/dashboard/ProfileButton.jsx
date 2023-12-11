import useResource from "src/hooks/useResource";
import { Badge, Button, IconButton, Stack, Tooltip } from "@mui/material";
import Iconify from "src/components/Iconify";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Gravatar from "src/components/Gravatar";

const ProfileButton = () => {
  const { user, unread } = useResource();
  const { t } = useTranslation();

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
            {`${t("inbox")} (${unread})`}
          </Button>
          <Button
            startIcon={<Iconify icon="mdi:account-group" />}
            color="inherit"
            component={Link}
            to="/teams"
          >
            {t("teams")}
          </Button>
        </Stack>
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
