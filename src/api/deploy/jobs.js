export const getJob = async (jobId, token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/jobs/" + jobId,
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
