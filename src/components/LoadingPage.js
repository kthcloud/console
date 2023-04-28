import { CircularProgress, Grid } from "@mui/material";
import Page from "../components/Page";

const LoadingPage = () => {
    const loadingMessages = [
      "Assembling cloud formations...",
      "Uploading to cloud nine...",
      "Synchronizing with the stratosphere...",
      "Warming up the server hamsters...",
      "Tuning the cloud orchestra...",
      "Unleashing the power of the cloud...",
      "Beaming up to the cloud...",
      "Performing quantum computations...",
      "Wrangling data into the cloud...",
      "Feeding the bandwidth beast...",
      "Brewing a storm in the cloud...",
      "Floating up to the data stratosphere...",
      "Loading fluffy digital dreams...",
      "Feeding Tux some fish..."
    ];

      const getLoadingMessage = () => {
        // Get useragent and current minute to ensure loading message is consistent through refreshes
        const agent = window.navigator.userAgent
        const minutes = new Date().getMinutes().toString();
        const hash = agent + minutes
        const hashNumber = hash.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
        const index = Math.abs(hashNumber % loadingMessages.length)
        return loadingMessages[index]
      };

    return ( <>
        <Page title="Deploy">
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: "100vh" }}
          >
            <Grid item xs={3} m={1}>
              <CircularProgress />
            </Grid>
            <Grid item xs={3} m={1}>
              <div>{getLoadingMessage()}</div>
            </Grid>
          </Grid>
        </Page>
      </>);
};

export default LoadingPage;