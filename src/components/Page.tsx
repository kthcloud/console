import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { forwardRef } from "react";
// @mui
import { Box } from "@mui/material";

const Page = forwardRef(({ children, title = "", meta, ...other }, ref) => {
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

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
};

export default Page;
