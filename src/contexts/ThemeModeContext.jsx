import { useMediaQuery } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const initialState = {
  mode: "light",
};

export const ThemeModeContext = createContext({
  ...initialState,
});

export const ThemeModeContextProvider = ({ children }) => {
  const [cookies, setCookie] = useCookies();

  const initial = useMediaQuery("(prefers-color-scheme: dark)")
    ? "dark"
    : "light";

  const [mode, setMode] = useState(initial);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    setCookie("mode", mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (cookies.mode) {
      setMode(cookies.mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};
