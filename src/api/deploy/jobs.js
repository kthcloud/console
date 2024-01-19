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

export const getJobs = async (
  token,
  pageSize = 1000,
  page = 1,
  all = false
) => {
  let allParam = all ? "&all=true" : "";

  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL +
      `/jobs?pageSize=${pageSize}&page=${page}${allParam}`,
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
