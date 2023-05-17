export const getDeployments = async (token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  const response = await res.json();
  const result = response.map((obj) => ({ ...obj, type: "deployment" }));
  if (Array.isArray(result)) return result;
  else throw new Error("Error getting deployments, response was not an array");
};

export const deleteDeployment = async (id, token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments/" + id,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (!res.ok) throw res;

  return await res.json();
};

export const getDeploymentYaml = async (id, token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments/" + id + "/ciConfig",
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


export const createDeployment = async (name, envs, token) => {
  const body = {
    name,
    envs
  };

  const res =  await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/deployments", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw res;
  return await res.json();
};

export const updateDeployment = async (id, envs, privateMode, token) => {
  const body = {
    envs: envs,
    private: privateMode
  };

  const res =  await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/deployments/" + id, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw res;
  return await res.json();
};