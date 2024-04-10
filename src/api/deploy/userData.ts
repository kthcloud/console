import { UserDataRead } from "kthcloud-types/types/v1/body";
import { Jwt } from "../../types";

export const getUserData = async (token: Jwt): Promise<UserDataRead[]> => {
  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/userData", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
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

export const createUserData = async (
  token: Jwt,
  key: string,
  value: string
): Promise<UserDataRead> => {
  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/userData", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ id: key, data: value }),
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

export const updateUserData = async (
  token: Jwt,
  key: string,
  value: string
): Promise<UserDataRead> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/userData/" + key,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ data: value }),
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

export const getUserDataByKey = async (
  token: Jwt,
  key: string
): Promise<UserDataRead> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/userData/" + key,
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

// export const deleteUserDataByKey = async (token: Jwt, key: string) => {
//   const res = await fetch(
//     import.meta.env.VITE_DEPLOY_API_URL + "/userData/" + key,
//     {
//       method: "DELETE",
//       headers: {
//         Authorization: "Bearer " + token,
//       },
//     }
//   );

//   if (!res.ok) {
//     const body = await res.json();
//     if (body) {
//       throw body;
//     }
//     throw res;
//   }
//   return await res.json();
// };
