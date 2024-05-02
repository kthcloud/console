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
import Page from "../../components/Page";
import useResource from "../../hooks/useResource";
import { Coin } from "./Coin";
import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { discover } from "../../api/deploy/discover";
import Scrollbar from "../../components/Scrollbar";
import { AlertList } from "../../components/AlertList";
export type Tier = {
  name: string;
  description: string;
  permissions: string[];
  quota: {
    deployments: number;
    cpuCores: number;
    ram: number;
    diskSize: number;
    snapshots: number;
  };
};

const TierCard = ({ tier }: { tier: Tier }) => {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState<boolean>(false);
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
          {(tier.permissions.includes("useGpus") ? "✅ " : "❌ ") +
            t("landing-hero-gpu")}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {(tier.permissions.includes("useCustomDomains") ? "✅ " : "❌ ") +
            t("use-custom-domains")}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`🚀 ${t("resource-deployments")}: ${tier.quota.deployments}`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`💻 ${t("landing-hero-cpu")}: ${tier.quota.cpuCores}`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`🧠 ${t("memory")}: ${tier.quota.ram} GB`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap" }}
        >
          {`💽 ${t("create-vm-disk-size")}: ${tier.quota.diskSize} GB`}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ whiteSpace: "nowrap", mb: 3 }}
        >
          {`📸 ${t("snapshots")}: ${tier.quota.snapshots}`}
        </Typography>

        {user?.role?.name === tier.name ? (
          <Button variant="contained" color="primary" fullWidth disabled>
            {t("current-plan")}
          </Button>
        ) : (
          <>
            {!user && tier.name === "default" ? (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
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
  // const tiers = tierConfig;

  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    discover().then((response) => {
      setTiers(response.roles);
    });
  }, []);

  return (
    <Page title={t("menu-tiers")}>
      <Container maxWidth="xl">
        <AlertList />

        <Stack spacing={3} alignItems={"center"}>
          <Typography variant="h2" gutterBottom>
            {t("menu-tiers")}
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 200, pb: 5 }}>
            {t("menu-tiers-subheader")}
          </Typography>
          <Box component="div" sx={{ width: "100%", pb: 5 }}>
            <Scrollbar>
              <Stack
                direction="row"
                spacing={5}
                sx={{
                  overflowX: "visible",
                  pb: 5,
                  minWidth: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {tiers.map((tier) => (
                  <TierCard tier={tier} key={tier.name} />
                ))}
              </Stack>
            </Scrollbar>
          </Box>
        </Stack>
      </Container>
    </Page>
  );
};
export default Tiers;
