import Hero from "./components/hero/Hero";
import Jeremy from "./components/intro/Intro";
import Page from "../../components/Page";
import { Box } from "@mui/material";

export function Landing() {
  return (
    <Page>
      <Box mt={5}></Box>
      <Hero />
      <Jeremy />
    </Page>
  );
}
