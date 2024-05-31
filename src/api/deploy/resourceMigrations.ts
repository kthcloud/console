import { ResourceMigrationCreate } from "@kthcloud/go-deploy-types/types/v2/body";
import { Jwt } from "../../types";

export const createResourceMigration = async (
  token: Jwt,
  body: ResourceMigrationCreate
) => {
  const url = `${import.meta.env.VITE_DEPLOY_API_URL}/resourceMigrations`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};
