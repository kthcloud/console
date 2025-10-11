import {
  BaseQueryParams,
  DeploymentQueryParams,
  GpuLeaseQueryParams,
  UserQueryParams,
  VmQueryParams,
} from "../types";

export function createQueryParams(
  params:
    | BaseQueryParams
    | UserQueryParams
    | DeploymentQueryParams
    | VmQueryParams
    | GpuLeaseQueryParams
): string {
  const searchParams = new URLSearchParams();

  if (params.all !== undefined) searchParams.append("all", String(params.all));
  if ("userId" in params && params.userId)
    searchParams.append("userId", params.userId);
  if ("shared" in params && params.shared !== undefined)
    searchParams.append("shared", String(params.shared));
  if ("vmId" in params && params.vmId) searchParams.append("vmId", params.vmId);
  if (params.page !== undefined)
    searchParams.append("page", String(params.page));
  if (params.pageSize !== undefined)
    searchParams.append("pageSize", String(params.pageSize));

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}
