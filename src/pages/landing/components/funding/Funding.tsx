import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { t } from "i18next";

const Funding = () => {
  return (
    <Container maxWidth="lg" sx={{ marginTop: 5 }}>
      <Grid container justifyContent={"space-between"} spacing={5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t("funding")} />
            <CardContent>
              <Typography variant="body1">
                {t("funding-provided-by")}
                <Link
                  href="https://www.kth.se/cbh/skolan-for-kemi-bioteknologi-och-halsa-1.763561"
                  target="_blank"
                  rel="noopener"
                >
                  KTH CBH
                </Link>
                ,{t("the")}
                <Link
                  href="https://erasmus-plus.ec.europa.eu/"
                  target="_blank"
                  rel="noopener"
                >
                  EU Erasmus+
                </Link>{" "}
                {t("program-and-the")}
                <Link
                  href="https://www.kth.se/en/forskning/forskningsplattformar/digitalisering/start-1.861040"
                  target="_blank"
                  rel="noopener"
                >
                  {t("kth-digitalization-platform")}
                </Link>
                .
                <br />
                <br />
                {t("computational-support")}
                <Link
                  href="https://www.pdc.kth.se/sv"
                  target="_blank"
                  rel="noopener"
                >
                  KTH PDC
                </Link>{" "}
                via{" "}
                <Link
                  href="https://www.kth.se/cs/cos/division-of-communication-systems-1.834507"
                  target="_blank"
                  rel="noopener"
                >
                  CoS
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Funding;
