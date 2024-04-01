export const getUser = async (userId, token) => {
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

export const getAllUsers = async (token) => {
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

export const updateUser = async (userId, token, data) => {
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

export const searchUsers = async (token, query) => {
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
