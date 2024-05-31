import { Jwt } from "../../types";

export const listVMSnapshots = async (token: Jwt, vmId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${vmId}/snapshots`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error listing VM snapshots, response was not an array");
  }
  return result;
};

export const createVMSnapshot = async (token: Jwt, vmId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${vmId}/snapshots`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error creating VM snapshot, response was not an object");
  }
  return result;
};

export const getVMSnapshot = async (
  token: Jwt,
  vmId: string,
  snapshotId: string
) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${vmId}/snapshot/${snapshotId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error getting VM snapshot, response was not an object");
  }
  return result;
};

export const deleteVMSnapshot = async (
  token: Jwt,
  vmId: string,
  snapshotId: string
) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${vmId}/snapshot/${snapshotId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Error deleting VM snapshot");
  }
  return await response.json();
};
