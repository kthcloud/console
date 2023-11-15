export const getNotifications = async (token) => {
    const url = `${process.env.REACT_APP_DEPLOY_API_URL}/notifications`;
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
    return result;
  };