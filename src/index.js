import "simplebar/dist/simplebar.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { initI18n } from "./i18next";
//
import App from "./App";
import "./theme/customStyle.css";
// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById("root"));
initI18n();

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
