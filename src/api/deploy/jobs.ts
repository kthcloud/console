export const getJob = async (jobId: string, token: string) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/jobs/" + jobId,
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
  token: string,
  pageSize = 100,
  page = 1,
  all = false
) => {
  let allParam = all ? "&all=true" : "";

  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL +
      `/jobs?sortOrder=-1&pageSize=${pageSize}&page=${page}${allParam}`,
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

export const restartJob = async (token: string, jobId: string) => {
  let body = { status: "pending" };

  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/jobs/" + jobId,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
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
