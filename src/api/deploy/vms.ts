export const getVM = async (token, id) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = [await response.json()];
  if (!Array.isArray(result)) {
    throw new Error("Error getting VMs, response was not an array");
  }
  return result.map((obj) => ({ ...obj, type: "vm" }));
};

export const getVMs = async (token, all = false) => {
  const allQuery = all ? "?all=true" : "";
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms${allQuery}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error getting VMs, response was not an array");
  }
  return result.map((obj) => ({ ...obj, type: "vm" }));
};

export const deleteVM = async (id, token) => {
  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
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

export const detachGPU = async (vm, token) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + vm.id,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ gpuId: "" }),
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

export const attachGPU = async (vm, token) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + vm.id,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ gpuId: "any" }),
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

export const attachGPUById = async (vm, token, id, noLeaseEnd = false) => {
  let body = { gpuId: id };

  if (noLeaseEnd) {
    body.noLeaseEnd = true;
  }

  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + vm.id,
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

export const getGPUs = async (token, availableOnly = false) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL +
      "/gpus" +
      (availableOnly ? "?available=true" : ""),
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

export const createVM = async (
  name,
  zone,
  sshPublicKey,
  cpuCores,
  diskSize,
  ram,
  token
) => {
  let body = {
    name,
    sshPublicKey,
    cpuCores,
    diskSize,
    ram,
  };

  if (zone) {
    body.zone = zone;
  }

  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/vms", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
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

export const updateVM = async (id, changes, token) => {
  const res = await fetch(import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + id, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(changes),
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

export const applyCommand = async (id, command, token) => {
  const body = { command: command };
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + id + "/command",
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

export const getSnapshots = async (id, token) => {
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + id + "/snapshots",
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
  const snapshots = await res.json();
  return snapshots;
};

export const createSnapshot = async (id, name, token) => {
  const body = { name: name };
  const res = await fetch(
    import.meta.env.VITE_DEPLOY_API_URL + "/vms/" + id + "/snapshots",
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

export const acceptVmTransfer = async (token, id, code) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/vms/${id}`;
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
