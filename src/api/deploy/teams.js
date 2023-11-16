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

export const getTeams = async (token) => {
  const url = `${process.env.REACT_APP_DEPLOY_API_URL}/teams`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let result = await response.json();
  result.sort((a, b) => {
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });
  return result;
};
