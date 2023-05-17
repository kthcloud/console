export const getUser = async (userId, token) => {
    const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/users/" + userId,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!res.ok) throw res;
  return await res.json();
};