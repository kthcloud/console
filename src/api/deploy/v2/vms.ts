import {
  VmActionCreate,
  VmCreate,
  VmUpdate,
} from "go-deploy-types/types/v2/body";
import { Jwt, Uuid } from "../../../types";

export const listVMs = async (
  token: Jwt,
  all?: boolean,
  userId?: Uuid,
  page?: number,
  pageSize?: number
) => {
  const queryParams = new URLSearchParams();
  if (all !== undefined) queryParams.set("all", String(all));
  if (userId) queryParams.set("userId", userId);
  if (page) queryParams.set("page", String(page));
  if (pageSize) queryParams.set("pageSize", String(pageSize));

  const queryString = queryParams.toString() ? `?${queryParams}` : "";
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vms${queryString}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    return [];
  }
  return result.map((obj) => ({ ...obj, type: "vm" }));
};

export const createVM = async (token: Jwt, body: VmCreate) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vms`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error creating VM, response was not an object");
  }
  return result;
};

export const getVMById = async (token: Jwt, vmId: Uuid) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vms/${vmId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error getting VM by ID, response was not an object");
  }
  return { ...result, type: "vm" };
};

export const updateVM = async (token: Jwt, vmId: Uuid, body: VmUpdate) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vms/${vmId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error updating VM, response was not an object");
  }
  return result;
};

export const deleteVM = async (token: Jwt, vmId: Uuid) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vms/${vmId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Error deleting VM");
  }
  return await response.json();
};

export const vmAction = async (
  token: Jwt,
  vmId: Uuid,
  body: VmActionCreate
) => {
  const url = `${import.meta.env.VITE_DEPLOY_V2_API_URL}/vmActions?vmId=${vmId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (typeof result !== "object") {
    throw new Error("Error creating VM action, response was not an object");
  }
  return result;
};
