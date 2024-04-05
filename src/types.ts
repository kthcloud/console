import {
  UserRead as User,
  UserDataRead as UserData,
  DeploymentRead,
  VmRead,
  JobRead,
} from "kthcloud-types/types/v1/body/index";

export type Uuid = string;
export type Jwt = string;

export interface Vm extends VmRead {
  type: string;
}

export interface Deployment extends DeploymentRead {
  type: string;
}

export type Resource = Vm | Deployment;

export interface UserResource extends User {
  userData: UserData[];
}

export interface Job extends JobRead {
  jobId: Uuid;
  name: string;
}
