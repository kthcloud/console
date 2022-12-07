import { Alert, AlertTitle, Fade } from "@mui/material";
import useAlert from "../hooks/useAlert";

const AlertPopup = () => {
  const { text, type, active } = useAlert();

  return (
    <Fade in={active} style={{ transitionDelay: "100ms" }} timeout={1000}>
      <Alert
        severity={type}
        sx={{
          position: "absolute",
          zIndex: 10,
        }}
      >
        <AlertTitle>{type.charAt(0).toUpperCase() + type.slice(1)}</AlertTitle>
        {text}
      </Alert>
    </Fade>
  );
};

export default AlertPopup;
