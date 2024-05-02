import { GetAlertsResponse } from "./types";

export const getAlerts = async (): Promise<GetAlertsResponse> => {
  const response = await fetch(import.meta.env.VITE_ALERT_API_URL);

  const result = await response.json();

  return result;
};
