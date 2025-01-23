import { Job } from "../../types";

export const getDeployment = async (token: string, id: string) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/deployments/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const response = [await res.json()];
  const result = response.map((obj) => ({
    ...obj,
    deploymentType: obj.type,
    type: "deployment",
  }));
  if (Array.isArray(result)) return result;
  else throw new Error("Error getting deployments, response was not an array");
};

export const getDeployments = async (token: string, all: boolean = false) => {
  const allQuery = all ? "?all=true" : "";
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/deployments${allQuery}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const response = await res.json();
  const result = response.map((obj: any) => ({
    ...obj,
    deploymentType: obj.type,
    type: "deployment",
  }));
  if (Array.isArray(result)) return result;
  else throw new Error("Error getting deployments, response was not an array");
};

export const deleteDeployment = async (id: string, token: string) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/deployments/" + id,
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

export const getDeploymentYaml = async (id: string, token: string) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/deployments/" + id + "/ciConfig",
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
  name: any,
  zone: any,
  image: any,
  imageArgs: any,
  envs: any,
  volumes: any,
  token: string
) => {
  let body: any = {
    name,
  };

  if (zone) body = { ...body, zone };
  if (image) body = { ...body, image };
  if (imageArgs) body = { ...body, args: imageArgs };
  if (envs) body = { ...body, envs };
  if (volumes) body = { ...body, volumes };

  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/deployments",
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

export const updateDeployment = async (
  id: string,
  changes: any,
  token: string
): Promise<Job> => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/deployments/" + id,
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

export const applyCommand = async (id: string, command: any, token: string) => {
  const body = { command: command };
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/deployments/" + id + "/command",
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
