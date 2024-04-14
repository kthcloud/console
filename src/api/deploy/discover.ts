import { Tier } from "../../pages/tiers/Tiers";

export type DiscoverResponse = {
  version: string;
  roles: Tier[];
};

export const discover = async (): Promise<DiscoverResponse> => {
  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/discover", {
    method: "GET",
  });

  if (!res.ok) {
    const body = await res.json();
    if (body) {
      throw body;
    }
    throw res;
  }
  return await res.json();
};
