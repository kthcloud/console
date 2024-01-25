export const getNotifications = async (token) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/notifications`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("Error getting notifications, response was not an array");
  }

  result.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return result;
};

export const markNotificationAsRead = async (token, id) => {
  const body = { read: true };
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/notifications/${id}`;
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

export const deleteNotification = async (token, id) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/notifications/${id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
