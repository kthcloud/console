import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextareaAutosize,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";

const SSHString = ({ resource }) => {
  const [textAreaValue, setTextAreaValue] = useState(resource.connectionString);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title="SSH Connection string" subheader={"Run this in your terminal to access the VM. Make sure you are using the correct SSH key."}/>
      <CardContent>
        <TextareaAutosize
          value={textAreaValue ? textAreaValue : "Loading..."}
          style={{ width: "100%", border: 0 }}
        />
      </CardContent>
      <CardActions>
        <CopyToClipboard text={textAreaValue}>
          <Button>Copy to clipboard</Button>
        </CopyToClipboard>{" "}
      </CardActions>
    </Card>
  );
};

export default SSHString;
