import { GpuLeaseCreate } from "@kthcloud/go-deploy-types/types/v2/body";
import { Jwt, Uuid } from "../../../types";

export const listGpuLeases = async (token: Jwt, vmId?: Uuid) => {
  const vmIdQuery = vmId ? `?vmId=${encodeURIComponent(vmId)}` : "";
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuLeases${vmIdQuery}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error listing GPU leases, response was not an array");
  }
  return result;
};

export const createGpuLease = async (token: Jwt, body: GpuLeaseCreate) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuLeases`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};

export const getGpuLease = async (token: Jwt, gpuLeaseId: Uuid) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuLeases/${gpuLeaseId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};

export const updateGpuLease = async (
  token: Jwt,
  gpuLeaseId: Uuid,
  body: any
) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuLeases/${gpuLeaseId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};

export const deleteGpuLease = async (token: Jwt, gpuLeaseId: Uuid) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/gpuLeases/${gpuLeaseId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw "Error deleting GPU lease";
  }
  return await response.json();
};
