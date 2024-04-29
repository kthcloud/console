import {
  UserRead,
  DeploymentRead,
  VmRead,
  JobRead,
} from "go-deploy-types/types/v1/body/index";
import {
  VmRead as V2VmRead,
  PortRead,
} from "go-deploy-types/types/v2/body/index";

export type Uuid = string;
export type Jwt = string;

export type Port = PortRead;

export interface VmV1 extends VmRead {
  type: "vmv1";
}

export interface Vm extends V2VmRead {
  type: "vm";
}

export interface Deployment extends DeploymentRead {
  type: "deployment";
  deploymentType?: string;
}

export type Resource = Vm | Deployment | VmV1;

export type User = UserRead;

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
