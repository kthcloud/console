export const getZones = async (token) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/zones`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error getting zones, response was not an array");
  }
  return result;
};
