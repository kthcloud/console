import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

const SSHString = ({ resource }) => {
  const { t } = useTranslation();
  const ssh = resource.connectionString;

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
          <Typography variant="body1">
            <CopyToClipboard text={ssh}>
              <Tooltip title={t("copy-to-clipboard")}>
                <b
                  style={{
                    fontFamily: "monospace",
                    cursor: "pointer",
                  }}
                >
                  {ssh}
                </b>
              </Tooltip>
            </CopyToClipboard>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SSHString;
