import { FC, ReactNode } from "react";
// material
import { alpha, styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const RootStyle = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
});

const IconStyle = styled("div")<{ theme: any }>(({ theme }) => ({
  marginLeft: -4,
  borderRadius: "50%",
  width: theme.spacing(2),
  height: theme.spacing(2),
  border: `solid 2px ${theme.palette.background.paper}`,
  boxShadow: `inset -1px 1px 2px ${alpha(theme.palette.common.black, 0.24)}`,
}));

interface ColorPreviewProps {
  colors: string[];
  limit?: number;
  children?: ReactNode;
}

const ColorPreview: FC<ColorPreviewProps> = ({
  colors,
  limit = 3,
  ...other
}) => {
  const showColor = colors.slice(0, limit);
  const moreColor = colors.length - limit;

  return (
    <RootStyle component="span" {...other}>
      {showColor.map((color, index) => (
        <IconStyle key={color + index} sx={{ bgcolor: color }} />
      ))}

      {colors.length > limit && (
        <Typography variant="subtitle2">{`+${moreColor}`}</Typography>
      )}
    </RootStyle>
  );
};

export default ColorPreview;
