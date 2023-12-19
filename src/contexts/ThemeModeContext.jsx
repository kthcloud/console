import { useMediaQuery } from "@mui/material";
import { createContext, useState } from "react";

const initialState = {
    mode: "light",
  };
  
  export const ThemeModeContext = createContext({
    ...initialState,
  });
  
  export const ThemeModeContextProvider = ({ children }) => {
    const initial = useMediaQuery("(prefers-color-scheme: dark)")
      ? "dark"
      : "light";
  
    const [mode, setMode] = useState(initial);
  
    const toggleMode = () => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };
  
    return (
      <ThemeModeContext.Provider value={{ mode, setMode, toggleMode }}>
        {children}
      </ThemeModeContext.Provider>
    );
  };
  