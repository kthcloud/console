import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";

const SSHString = ({ resource }) => {
  const ssh = resource.connectionString;

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader
        title="SSH Connection string"
        subheader={"Run this in your terminal to access the VM"}
      />
      <CardContent>
        {!ssh ? (
          <Skeleton height={"2rem"} sx={{ maxWidth: "30rem" }} />
        ) : (
          <Typography variant="body1">
            <CopyToClipboard text={ssh}>
              <Tooltip title="Copy to clipboard">
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
