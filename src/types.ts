import {
  UserRead,
  DeploymentRead,
  JobRead,
} from "@kthcloud/go-deploy-types/types/v1/body/index";
import {
  VmRead as V2VmRead,
  PortRead,
} from "@kthcloud/go-deploy-types/types/v2/body/index";

export type Uuid = string;
export type Jwt = string;

export type Port = PortRead;

export interface Vm extends V2VmRead {
  type: "vm";
}

export interface Deployment extends DeploymentRead {
  type: "deployment";
  deploymentType?: string;
}

export type Resource = Vm | Deployment;

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
