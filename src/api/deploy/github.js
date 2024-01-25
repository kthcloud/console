export const getRepositories = async (code, token) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/github/repositories?code=" + code,
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
