export const joinTeam = async (token: string, teamId: string, code: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams/${teamId}`;
  const body = { invitationCode: code };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  return result;
};

export const getTeams = async (token: string, all = false) => {
  let allParam = all ? "?all=true" : "";
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams${allParam}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let result = await response.json();
  result.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  for (let i = 0; i < result.length; i++) {
    result[i].members &&
      result[i].members.sort((a: any, b: any) => {
        return a.id < b.id ? -1 : 1;
      });

    result[i].resources &&
      result[i].resources.sort((a: any, b: any) => {
        return a.id < b.id ? -1 : 1;
      });
  }
  return result;
};

export const createTeam = async (token: string, name: string, description: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams`;

  let res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
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

export const deleteTeam = async (token: string, teamId: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams/${teamId}`;

  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const addMembers = async (token: string, teamId: string, members: { id: string }[]) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams/${teamId}`;
  const body = { members: members };

  let res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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

export const updateTeam = async (token: string, teamId: string, body: any) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/teams/${teamId}`;

  let res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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
