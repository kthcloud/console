export const joinTeam = async (token, teamId, code) => {
  const url = `${process.env.REACT_APP_DEPLOY_API_URL}/teams/${teamId}`;
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
