import { FC, ChangeEvent } from "react";
import { styled } from "@mui/material/styles";
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import Iconify from "../../components/Iconify";
import ConfirmButton from "../../components/ConfirmButton";
import { useTranslation } from "react-i18next";

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(["box-shadow", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&.Mui-focused": { width: 320, boxShadow: theme.customShadows.z8 },
  "& fieldset": {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

interface ListToolbarProps {
  numSelected: number;
  filterName: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onDelete?: () => void;
}

const ListToolbar: FC<ListToolbarProps> = ({
  numSelected,
  filterName,
  onFilterName,
  loading,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: "primary.main",
          bgcolor: "primary.lighter",
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {`${numSelected} ${t("selected")}`}
        </Typography>
      ) : (
        <SearchStyle
          value={filterName}
          onChange={onFilterName}
          placeholder={t("deploy-search")}
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: "text.disabled", width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <ConfirmButton
          action={t("button-delete")}
          actionText={
            "delete " + numSelected + " resource" + (numSelected > 1 ? "s" : "")
          }
          callback={onDelete}
          props={{
            color: "error",
            variant: "contained",
            startIcon: <Iconify icon="eva:trash-2-fill" />,
          }}
        />
      ) : (
        <>
          {loading ? (
            <Tooltip enterTouchDelay={10} title={t("deploy-updating")}>
              <IconButton>
                <Iconify icon="eos-icons:three-dots-loading" />
              </IconButton>
            </Tooltip>
          ) : null}
        </>
      )}
    </RootStyle>
  );
};

export default ListToolbar;