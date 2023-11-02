import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Page from "src/components/Page";
import tierConfig from "./tiers.json";
import useResource from "src/hooks/useResource";
import { Coin } from "./Coin";
import { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

const TierCard = ({ tier }) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);
  const { user } = useResource();
  const { keycloak } = useKeycloak();

  return (
    <Card
      key={tier.name}
      sx={{
        boxShadow: 3,
        border:
          user?.role?.name === tier.name || (!user && tier.name === "default")
            ? 1
            : 0,
        borderColor: "primary.main",
        minWidth: 250,
      }}
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
    >
      <CardContent>
        <Coin tier={tier.name} spin={hovering} />
        <Typography
          variant="h3"
          gutterBottom
          sx={{ whiteSpace: "nowrap", mb: 3, textAlign: "center" }}
        >
          {t(tier.name)}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {(tier.permissions.useGpus ? "✅ " : "❌ ") + t("landing-hero-gpu")}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {(tier.permissions.useCustomDomains ? "✅ " : "❌ ") +
            t("use-custom-domains")}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`🚀 ${t("resource-deployments")}: ${tier.quotas.deployments}`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`💻 ${t("landing-hero-cpu")}: ${tier.quotas.cpuCores}`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`🧠 ${t("memory")}: ${tier.quotas.ram} GB`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`💽 ${t("create-vm-disk-size")}: ${tier.quotas.diskSize} GB`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap", mb: 3 }}
        >
          {`📸 ${t("snapshots")}: ${tier.quotas.snapshots}`}
        </Typography>

        {user?.role?.name === tier.name ? (
          <Button variant="contained" color="primary" fullWidth m={3} disabled>
            {t("current-plan")}
          </Button>
        ) : (
          <>
            {!user && tier.name === "default" ? (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                m={3}
                onClick={() =>
                  keycloak.login({
                    redirectUri: window.location.origin + "/deploy",
                  })
                }
              >
                {t("button-login")}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                m={3}
                href="https://discord.gg/MuHQd6QEtM"
              >
                {t("contact-us")}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Tiers = () => {
  const { t } = useTranslation();
  const tiers = tierConfig;

  return (
    <Page title={t("menu-tiers")}>
      <Container maxWidth={false}>
        <Stack spacing={3} alignItems={"center"}>
          <Typography variant="h2" gutterBottom>
            {t("menu-tiers")}
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 200, pb: 5 }}>
            {t("menu-tiers-subheader")}
          </Typography>

          <Box
            sx={{
              overflowX: "auto",
              maxWidth: "100%",
              display: "flex",
              flexWrap: "nowrap",
              paddingBottom: "16px",
            }}
          >
            <Stack direction="row" spacing={5}>
              <Box sx={{ minWidth: 20 }}></Box>
              {tiers.map((tier) => (
                <TierCard tier={tier} key={tier.name}/>
              ))}
              <Box sx={{ minWidth: 20 }}></Box>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Page>
  );
};
export default Tiers;
