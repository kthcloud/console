import { Jwt } from "../../../types";

export const listGpuGroups = async (token: Jwt, vmId?: string) => {
  const vmIdQuery = vmId ? `?vmId=${encodeURIComponent(vmId)}` : "";
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuGroups${vmIdQuery}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error listing GPU groups, response was not an array");
  }
  return result;
};

export const getGpuGroup = async (token: Jwt, gpuGroupId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuGroups/${gpuGroupId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error getting GPU group, response was not an object");
  }
  return result;
};
