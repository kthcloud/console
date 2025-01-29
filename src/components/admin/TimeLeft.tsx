import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

const TimeLeft: React.FC<{ targetDate: string | undefined }> = ({
  targetDate,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const calculateTimeLeft = (targetDate: string) => {
    const now = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const diff = targetTime - now;

    if (diff <= 0) return "Expired";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} left`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} left`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
    }
    if (seconds > 0) {
      return `${seconds} second${seconds > 1 ? "s" : ""} left`;
    }
    return "Just now";
  };

  useEffect(() => {
    if (targetDate) {
      setTimeLeft(calculateTimeLeft(targetDate));

      const interval = setInterval(() => {
        if (targetDate) {
          setTimeLeft(calculateTimeLeft(targetDate));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [targetDate]);

  return <Typography variant="body2">{timeLeft}</Typography>;
};

export default TimeLeft;
