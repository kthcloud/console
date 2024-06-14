import {
  ResourceMigrationCreate,
  ResourceMigrationUpdate,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { Jwt } from "../../types";

export const createResourceMigration = async (
  token: Jwt,
  body: ResourceMigrationCreate
) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations`;
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

export const getMigration = async (token: Jwt, id: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations/${id}`;
  const response = await fetch(url, {
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

export const listMigrations = async (token: Jwt) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations`;
  const response = await fetch(url, {
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

export const deleteMigration = async (token: Jwt, id: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations/${id}`;
  const response = await fetch(url, {
    method: "DELETE",
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

export const acceptMigration = async (token: Jwt, id: string, code: string) => {
  const body: ResourceMigrationUpdate = {
    status: "accepted",
    code: code,
  };

  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations/${id}`;
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
