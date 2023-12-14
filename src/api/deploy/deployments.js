export const getDeployment = async (token, id) => {
  const url = `${process.env.REACT_APP_DEPLOY_API_URL}/deployments/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const response = [await res.json()];
  const result = response.map((obj) => ({ ...obj, type: "deployment" }));
  if (Array.isArray(result)) return result;
  else throw new Error("Error getting deployments, response was not an array");
};

export const getDeployments = async (token, all = false) => {
  const allQuery = all ? "&all=true" : "";
  const url = `${process.env.REACT_APP_DEPLOY_API_URL}/deployments?shared=true${allQuery}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const response = await res.json();
  const result = response.map((obj) => ({
    ...obj,
    deploymentType: obj.type,
    type: "deployment",
  }));
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

  if (!res.ok) {
    const body = await res.json();
    if (
      Object.hasOwn(body, "errors") &&
      Array.isArray(body.errors) &&
      body.errors.length > 0
    )
      throw body.errors[0].msg;
    else throw res;
  }

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

  if (!res.ok) {
    const body = await res.json();
    if (body) {
      throw body;
    }
    throw res;
  }
  return await res.json();
};

export const createDeployment = async (
  name,
  zone,
  image,
  domain,
  envs,
  repo,
  volumes,
  accessToken,
  token
) => {
  let body = {
    name,
  };

  if (zone) body = { ...body, zone };
  if (image) body = { ...body, image };
  if (domain) body = { ...body, customDomain: domain };
  if (envs) body = { ...body, envs };
  if (volumes) body = { ...body, volumes };

  if (!image && repo)
    body = {
      ...body,
      github: {
        repositoryId: repo,
        token: accessToken,
      },
    };

  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments",
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

export const updateDeployment = async (id, changes, token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments/" + id,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(changes),
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

export const applyCommand = async (id, command, token) => {
  const body = { command: command };
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL + "/deployments/" + id + "/command",
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
  return true;
};

export const acceptDeploymentTransfer = async (token, id, code) => {
  const url = `${process.env.REACT_APP_DEPLOY_API_URL}/deployments/${id}`;
  const body = { transferCode: code };

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
