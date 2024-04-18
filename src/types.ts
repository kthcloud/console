import {
  UserRead,
  UserDataRead as UserData,
  DeploymentRead,
  VmRead,
  JobRead,
  GpuRead,
} from "kthcloud-types/types/v1/body/index";
import {
  VmRead as V2VmRead,
  GpuLeaseRead,
  PortRead,
} from "kthcloud-types/types/v2/body/index";

export type Uuid = string;
export type Jwt = string;

export type Port = PortRead;

export interface VmV1 extends VmRead {
  type: "vmv1";
  gpu?: GpuRead;
}

export interface Vm extends V2VmRead {
  type: "vm";
  gpu?: GpuLeaseRead;
}

export interface Deployment extends DeploymentRead {
  type: "deployment";
  deploymentType?: string;
}

export type Resource = Vm | Deployment | VmV1;

export interface User extends UserRead {
  userData?: UserData[];
}

export interface Job extends JobRead {
  jobId: Uuid;
  name: string;
}

export type ValidationError = {
  [key: string]: string[];
};

export type ErrorElement = {
  msg: string;
};

export type DeployApiError = {
  validationErrors?: ValidationError;
  errors?: ErrorElement[];
};
