import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

const TimeAgo: React.FC<{ createdAt: string | undefined }> = ({
  createdAt,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  const calculateTimeAgo = (createdAt: string) => {
    const now = new Date().getTime();
    const createdDate = new Date(createdAt).getTime();
    const diff = now - createdDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    if (seconds > 0) {
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  useEffect(() => {
    if (createdAt) {
      setTimeAgo(calculateTimeAgo(createdAt));

      const interval = setInterval(() => {
        if (createdAt) {
          setTimeAgo(calculateTimeAgo(createdAt));
        }
      }, 1000);

      return () => clearInterval(interval); // Clean up the interval on component unmount
    }
  }, [createdAt]);

  return <Typography variant="body2">{timeAgo}</Typography>;
};

export default TimeAgo;
