import {
  ApiKeyCreated,
  UserRead,
  UserReadDiscovery,
  UserUpdate,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { Jwt, Uuid } from "../../types";

export const getUser = async (
  userId: string,
  token: string
): Promise<UserRead> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/users/" + userId,
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

export const getAllUsers = async (token: Uuid): Promise<UserRead[]> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/users?all=true",
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

export const updateUser = async (
  userId: string,
  token: string,
  data: UserUpdate
): Promise<UserRead> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/users/" + userId,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
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

export const searchUsers = async (
  token: string,
  query: string
): Promise<UserRead[]> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL +
      "/users?all=true&discover=true&search=" +
      encodeURIComponent(query),
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

export const createApiKey = async (
  token: Jwt,
  userId: string,
  name: string,
  expiresAt: string
): Promise<ApiKeyCreated> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/users/" + userId + "/apiKeys",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ expiresAt, name }),
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

export const discoverUserById = async (
  userId: string,
  token: string
): Promise<UserReadDiscovery> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/users/" + userId + "?discover=true",
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
