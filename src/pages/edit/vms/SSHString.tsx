import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CopyButton from "../../../components/CopyButton";
import { Vm } from "../../../types";

const SSHString = ({ vm }: { vm: Vm }) => {
  const { t } = useTranslation();
  const ssh = vm.sshConnectionString;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title={t("ssh-string")}
        subheader={t("ssh-string-subheader")}
      />
      <CardContent>
        {!ssh ? (
          <Skeleton height={"2rem"} sx={{ maxWidth: "30rem" }} />
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1">
              <b
                style={{
                  fontFamily: "monospace",
                }}
              >
                {ssh}
              </b>
            </Typography>
            <CopyButton content={ssh} />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default SSHString;
