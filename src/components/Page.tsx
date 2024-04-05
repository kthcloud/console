import { Helmet } from "react-helmet-async";
import { forwardRef, ReactNode, ForwardedRef } from "react";
import { Box } from "@mui/material";

interface PageProps {
  children: ReactNode;
  title?: string;
  meta?: ReactNode;
}

const Page = forwardRef((props: PageProps, ref: ForwardedRef<any>) => {
  const { children, title = "", meta, ...other } = props;
  const isCbhCloud = window.location.hostname.includes("cloud.cbh.kth.se");
  const pageTitle = isCbhCloud ? "cbhcloud" : "kthcloud";

  return (
    <>
      <Helmet>
        {title !== "" ? (
          <title>{`${title} | ${pageTitle}`}</title>
        ) : (
          <title>{`${pageTitle}`}</title>
        )}

        {meta}
      </Helmet>

      <Box ref={ref} {...other}>
        {children}
      </Box>
    </>
  );
});

Page.displayName = "Page";

export default Page;
