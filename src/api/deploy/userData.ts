export const getUserData = async (token: string) => {
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

export const updateUserData = async (token: string, key: string, value: string) => {
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

export const getUserDataByKey = async (token: string, key: string) => {
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

export const deleteUserDataByKey = async (token: string, key: string) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/userData/" + key,
    {
      method: "DELETE",
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
