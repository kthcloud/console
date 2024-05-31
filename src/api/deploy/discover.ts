import { DiscoverRead } from "@kthcloud/go-deploy-types/types/v2/body";

export const discover = async (): Promise<DiscoverRead> => {
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
