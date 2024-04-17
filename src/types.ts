import {
  UserRead,
  UserDataRead as UserData,
  DeploymentRead,
  VmRead,
  JobRead,
  GpuRead,
  PortRead,
} from "kthcloud-types/types/v1/body/index";
import {
  VmRead as V2VmRead,
  GpuLeaseRead,
} from "kthcloud-types/types/v2/body/index";

export type Uuid = string;
export type Jwt = string;

export type Port = PortRead;

export interface Vm extends VmRead {
  type: "vm";
  gpu?: GpuRead;
  ports: Port[];
}

export interface VmV2 extends V2VmRead {
  type: "vmv2";
  gpu?: GpuLeaseRead;
}

export interface Deployment extends DeploymentRead {
  type: "deployment";
  deploymentType?: string;
}

export type Resource = VmV2 | Deployment | Vm;

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
