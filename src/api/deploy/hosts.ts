import { HostVerboseRead } from "@kthcloud/go-deploy-types/types/v2/body";
import { Uuid } from "../../types";

export const getHostsVerbose = async (
  token: Uuid
): Promise<HostVerboseRead[]> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/hosts/verbose",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!res.ok) {
    const body = await res.json();
    if (body) {
      throw body;
    }
    throw res;
  }
  return await res.json();
};
