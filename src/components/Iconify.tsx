import { Icon } from "@iconify/react";
import { Box } from "@mui/material";

interface IconifyProps {
  icon: JSX.Element | string;
  sx?: object;
  [key: string]: any;
}

export default function Iconify({ icon, sx, ...other }: IconifyProps) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}