import { SystemCapacities } from "@kthcloud/go-deploy-types/types/v2/body";
import { Uuid } from "../../types";

export const getSystemCapacities = async (
  token: Uuid,
  n?: number
): Promise<SystemCapacities | undefined> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL +
      "/systemCapacities" +
      (n !== undefined ? "?n=" + n : ""),
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
  const cap = await res.json();
  return cap.length > 0 ? cap[0]?.capacities ?? undefined : undefined;
};
