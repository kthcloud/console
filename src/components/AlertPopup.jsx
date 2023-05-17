import { Alert, AlertTitle, Fade } from "@mui/material";
import useAlert from "../hooks/useAlert";

const AlertPopup = () => {
  const { text, type, active } = useAlert();

  return (
    <Fade in={active} style={{ transitionDelay: "100ms" }} timeout={300}>
      <Alert
        severity={type}
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: "100%",
          maxWidth: "1152px",
        }}
      >
        <AlertTitle>{type.charAt(0).toUpperCase() + type.slice(1)}</AlertTitle>
        {text}
      </Alert>
    </Fade>
  );
};

export default AlertPopup;
