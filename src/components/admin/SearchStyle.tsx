import { OutlinedInput, styled } from "@mui/material";
import { CustomTheme } from "../../theme/types";

export const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(["box-shadow", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&.Mui-focused": {
    width: 320,
    boxShadow: (theme as CustomTheme).customShadows.z8,
  },
  "& fieldset": {
    borderWidth: `1px !important`,
    borderColor: `${(theme as CustomTheme).palette.grey[500_32]} !important`,
  },
}));
