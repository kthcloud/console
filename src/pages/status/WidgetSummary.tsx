import { alpha, styled, useTheme } from "@mui/material/styles";
import { Card, Typography } from "@mui/material";
import { fShortenNumber } from "../../utils/formatNumber";
import Iconify from "../../components/Iconify";
import { CustomTheme, ThemeColor } from "../../theme/types";

const IconWrapperStyle = styled("div")(({ theme }) => ({
  margin: "auto",
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: "center",
  marginBottom: theme.spacing(3),
}));

interface WidgetSummaryProps {
  color?: ThemeColor;
  icon?: string;
  title: string;
  total: number;
  sx?: object;
  [key: string]: any;
}

export default function WidgetSummary({
  title,
  total,
  icon,
  color = "primary",
  sx,
  ...other
}: WidgetSummaryProps) {
  const theme: CustomTheme = useTheme();

  const textColor =
    theme.palette.mode === "light"
      ? theme.palette[color].darker
      : theme.palette[color].lighter;
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette[color].lighter
      : theme.palette[color].darker;
  const iconColor =
    theme.palette.mode === "light"
      ? theme.palette[color].darker
      : theme.palette[color].lighter;

  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 20,
        textAlign: "center",
        color: textColor,
        bgcolor: backgroundColor,
        ...sx,
      }}
      {...other}
    >
      <IconWrapperStyle
        sx={{
          color: iconColor,
          backgroundImage: `linear-gradient(135deg, ${alpha(iconColor, 0)} 0%, ${alpha(
            iconColor,
            0.24
          )} 100%)`,
        }}
      >
        {icon && <Iconify icon={icon} width={24} height={24} />}
      </IconWrapperStyle>
      <Typography variant="h3">{fShortenNumber(total)}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>
    </Card>
  );
}
