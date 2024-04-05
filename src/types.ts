import {
  UserRead,
  UserDataRead as UserData,
  DeploymentRead,
  VmRead,
  JobRead,
  GpuRead,
} from "kthcloud-types/types/v1/body/index";

export type Uuid = string;
export type Jwt = string;

export interface Vm extends VmRead {
  type: string;
  gpu?: GpuRead;
}

export interface Deployment extends DeploymentRead {
  type: string;
}

export type Resource = Vm | Deployment;

export interface User extends UserRead {
  userData: UserData[];
}

export interface Job extends JobRead {
  jobId: Uuid;
  name: string;
}
