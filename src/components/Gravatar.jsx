import { Avatar } from "@mui/material";
import { MD5 } from "crypto-js";
import { useEffect, useState } from "react";

const Gravatar = ({ user, fallback, ...props }) => {
  const [userAvatar, setUserAvatar] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const gravatar = async () => {
    if (!user.email) user.email = user.username;
    if (!user.email) return null;

    const cleaned = user.email.trim().toLowerCase();
    const hash = MD5(cleaned, { encoding: "binary" }).toString();

    const uri = encodeURI(`https://www.gravatar.com/avatar/${hash}?d=404`);

    const response = await fetch(uri);
    if (response.ok) {
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
    if (!(user && (user.email || user.username) && !hasFetched)) return;
    fetchProfilePic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Avatar sx={{ width: 20, height: 20 }} src={userAvatar} {...props}>
      {!userAvatar && fallback
        ? fallback
        : (user.email || user.username)?.[0].toUpperCase()}
    </Avatar>
  );
};

export default Gravatar;
