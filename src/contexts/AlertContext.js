import { createContext, useState } from "react";

const ALERT_TIME = 3000;
const initialState = {
  text: "",
  type: "",
};

const AlertContext = createContext({
  ...initialState,
  setAlert: () => {},
});

export const AlertProvider = ({ children }) => {
  const [text, setText] = useState("placeholder");
  const [type, setType] = useState("success");
  const [active, setActive] = useState(false);

  const setAlert = (text, type) => {
    setText(text);
    setType(type);
    setActive(true);

    setTimeout(() => {
      setActive(false);
    }, ALERT_TIME);
  };

  return (
    <AlertContext.Provider
      value={{
        text,
        type,
        active,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
