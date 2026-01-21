/**
 * GpuClaimRead is a detailed DTO for administrators
 * providing full visibility into requested, allocated,
 * and consumed GPU resources.
 */
export interface GpuClaimRead {
  id: string;
  name: string;
  zone: string;
  allowedRoles?: string[];
  /**
   * Requested contains all requested GPU configurations by key (request.Name).
   */
  requested?: { [key: string]: RequestedGpu };
  /**
   * Allocated contains the GPUs that have been successfully bound/allocated.
   */
  allocated?: { [key: string]: AllocatedGpu[] };
  /**
   * Consumers are the workloads currently using this claim.
   */
  consumers?: GpuClaimConsumer[];
  /**
   * Status reflects the reconciliation and/or lifecycle state.
   */
  status?: GpuClaimStatus;
  /**
   * LastError holds the last reconciliation or provisioning error message.
   */
  lastError?: string;
  createdAt: string;
  updatedAt?: string;
}
export interface GpuClaimCreate {
  name: string;
  zone?: string;
  allowedRoles?: string[];
  /**
   * Requested contains all requested GPU configurations by key (request.Name).
   */
  requested?: RequestedGpuCreate[];
}
export interface GpuClaimCreated {
  id: string;
  jobId: string;
}
export interface RequestedGpuCreate {
  RequestedGpu: RequestedGpu;
  name: string;
}
/**
 * RequestedGpu describes the desired GPU configuration that was requested.
 */
export interface RequestedGpu {
  allocationMode: string;
  capacity?: { [key: string]: string };
  count?: number /* int64 */;
  deviceClassName: string;
  selectors?: string[];
  config?: GpuDeviceConfigurationWrapper;
}
export interface GpuDeviceConfigurationWrapper {}
/**
 * GpuDeviceConfiguration represents a vendor-specific GPU configuration.
 */
export type GpuDeviceConfiguration = any /* json.Marshaler */;
/**
 * GenericDeviceConfiguration is a catch-all configuration when no vendor-specific struct is used.
 */
export interface GenericDeviceConfiguration {
  driver: string;
}
/**
 * NvidiaDeviceConfiguration represents NVIDIA-specific configuration options.
 */
export interface NvidiaDeviceConfiguration {
  driver: string;
  sharing?: any /* nvidia.GpuSharing */;
}
/**
 * AllocatedGpu represents a concrete allocated GPU or GPU share.
 */
export interface AllocatedGpu {
  pool?: string;
  device?: string;
  shareID?: string;
  adminAccess?: boolean;
}
/**
 * GpuClaimConsumer describes a workload consuming this GPU claim.
 */
export interface GpuClaimConsumer {
  apiGroup?: string;
  resource?: string;
  name?: string;
  uid?: string;
}
/**
 * GpuClaimStatus represents runtime state and metadata about allocation progress.
 */
export interface GpuClaimStatus {
  phase?: string;
  message?: string;
  updatedAt?: string;
  lastSynced?: string;
}
