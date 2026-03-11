import { Dispatch, SetStateAction } from "react";
import { Visibility } from "../../types";
import {
  Card,
  CardContent,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export type VisibilitySelectorProps = {
  visibility: Visibility;
  setVisibility: Dispatch<SetStateAction<Visibility>>;
};

export default function VisibilitySelector({
  visibility,
  setVisibility,
}: VisibilitySelectorProps) {
  const { t } = useTranslation();
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Visibility
  ) => {
    setVisibility(value);
  };
  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("admin-visibility")}
        subheader={t("visibility-subheader")}
      />

      <CardContent>
        <ToggleButtonGroup
          color="primary"
          value={visibility}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <Tooltip enterTouchDelay={10} title={t("visibility-public-tooltip")}>
            <ToggleButton value="public">
              {t("admin-visibility-public")}
            </ToggleButton>
          </Tooltip>
          <Tooltip enterTouchDelay={10} title={t("visibility-auth-tooltip")}>
            <ToggleButton value="auth">
              <>{t("admin-visibility-auth")}</>
            </ToggleButton>
          </Tooltip>
          <Tooltip enterTouchDelay={10} title={t("visibility-private-tooltip")}>
            <ToggleButton value="private">
              {t("admin-visibility-private")}
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </CardContent>
    </Card>
  );
}
