import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ResourceComparisonTable from "./ResourceComparisonTable";

const ResourceTypeInfo = () => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3} direction="column">
      <Typography variant="body2">
        <b>{t("deployment")}</b>
        <br />
        {t("explain-deployment")}
        <br />
        <br />
        <b>VM ({t("vm")})</b>
        <br />
        {t("explain-vm")}
      </Typography>

      <Typography variant="body2" mb={0}></Typography>

      <Stack
        spacing={3}
        direction="row"
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        justifyContent="space-between"
      >
        <ResourceComparisonTable />
      </Stack>
    </Stack>
  );
};
export default ResourceTypeInfo;
