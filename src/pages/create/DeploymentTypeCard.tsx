import { Dispatch, SetStateAction, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface DeploymentTypeProps {
  image: string;
  setImage: Dispatch<SetStateAction<string>>;
  imageArgs: string;
  setImageArgs: Dispatch<SetStateAction<string>>;
}

export default function DeploymentTypeCard({
  image,
  setImage,
  imageArgs,
  setImageArgs,
}: DeploymentTypeProps) {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    // If switching to custom deployment, clear the image
    if (newValue === 1) setImage("");
  };

  return (
    <Card sx={{ boxShadow: 20, padding: "0.5rem 1rem 1rem 1rem" }}>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label={t("image")} />
        <Tab label={t("custom-deployment")} />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <CardContent sx={{ padding: "0 0.5rem 0.5rem 0.5rem" }}>
          <Typography mb="1rem">
            {t("create-deployment-image-subheader")}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            alignItems={"center"}
            flexWrap={"wrap"}
            useFlexGap
          >
            <TextField
              label={t("create-deployment-image")}
              variant="outlined"
              placeholder="mongo:latest"
              value={image}
              onChange={(e) => setImage(e.target.value.trim())}
              fullWidth
            />
            <TextField
              label={t("run-args")}
              variant="outlined"
              placeholder="--setParameter httpVerboseLogging=true"
              value={imageArgs}
              onChange={(e) => setImageArgs(e.target.value)}
              fullWidth
            />
          </Stack>
        </CardContent>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <CardContent sx={{ padding: "0 0.5rem 0.5rem 0.5rem" }}>
          <Typography variant="body1" gutterBottom>
            {t("custom-deployment-description")}
          </Typography>
        </CardContent>
      </TabPanel>
    </Card>
  );
}
