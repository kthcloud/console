import { createContext, useEffect, useState } from "react";
import { Alert } from "../api/alert/types";
import useInterval from "../hooks/useInterval";
import { getAlerts } from "../api/alert";

type AlertContextType = {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
};

const initialState: AlertContextType = {
  alerts: [],
  setAlerts: () => {},
};

export const AlertContext = createContext(initialState);

export const AlertContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    getAlerts().then((data) => {
      setAlerts(data.alerts);
    });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useInterval(() => {
    fetchAlerts();
  }, 60000);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
