import { getDeploymentYaml } from "src/api/deploy/deployments";
import { useKeycloak } from "@react-keycloak/web";
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

const GHActions = ({ resource }) => {
  const { keycloak, initialized } = useKeycloak();
  const [textAreaValue, setTextAreaValue] = useState(null);

  const loadYaml = async () => {
    const res = await getDeploymentYaml(resource.id, keycloak.token);
    setTextAreaValue(res.config);
  };

  useEffect(() => {
    if (!initialized) return;
    if (textAreaValue) return;
    loadYaml();
  }, []);

  return (
    <Card sx={{ boxShadow: 20 }}>
      <CardHeader title="GitHub Actions YAML" subheader={"Run this workflow to publish your app"}/>
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

export default GHActions;
