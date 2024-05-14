import { IconButton, IconButtonProps } from "@mui/material";
import Iconify from "./Iconify";
import { useState } from "react";

export default function RandomizeButton({ onClick, size }: IconButtonProps) {
  const [rotateDice, setRotateDice] = useState(false);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setRotateDice(true);
    if (onClick) {
      onClick(e);
    }

    setTimeout(() => {
      setRotateDice(false);
    }, 500);
  };
  return (
    <IconButton
      onClick={handleClick}
      size={size}
      sx={
        rotateDice
          ? {
              animation: "spin 0.5s ease-in-out infinite",
              "@keyframes spin": {
                "0%": {
                  transform: "rotate(180deg)",
                },
                "100%": {
                  transform: "rotate(0deg)",
                },
              },
            }
          : undefined
      }
    >
      <Iconify icon="mdi:dice-3-outline" />
    </IconButton>
  );
}
