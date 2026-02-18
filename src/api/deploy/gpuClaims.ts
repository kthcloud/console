import { GpuClaimCreate } from "../../temporaryTypesRemoveMe";
import { Jwt } from "../../types";

export const listGpuClaims = async (token: Jwt, detailed?: boolean) => {
  const detailedQuery = detailed
    ? `?detailed=${encodeURIComponent(detailed)}`
    : "";
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/gpuClaims${detailedQuery}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!Array.isArray(result)) {
    throw new Error("Error listing GPU claims, response was not an array");
  }

  result.sort((a: any, b: any) => {
    return a.id < b.id ? -1 : 1;
  });

  return result;
};

export const getGpuClaim = async (token: Jwt, gpuClaimId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/gpuClaims/${gpuClaimId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error getting GPU claim, response was not an object");
  }
  return result;
};

export const deleteGpuClaim = async (token: Jwt, gpuClaimId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/gpuClaims/${gpuClaimId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error deleting GPU claim, response was not an object");
  }
  return result;
};

export const createGpuClaim = async (token: Jwt, gpuClaim: GpuClaimCreate) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/gpuClaims`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gpuClaim),
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error creating GPU claim, response was not an object");
  }
  return result;
};
