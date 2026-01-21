import {
  Box,
  Card,
  Chip,
  Container,
  LinearProgress,
  Link,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import useResource from "../../hooks/useResource";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import useAdmin from "../../hooks/useAdmin";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import ResourceTab from "../../components/admin/ResourceTab";
import {
  DeploymentRead,
  GpuGroupRead,
  GpuLeaseRead,
  TeamRead,
  UserRead,
  VmRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import {
  renderResourceStatus,
  renderResourceWithGPU,
  renderShared,
  renderStale,
  renderStatusCode,
} from "../../components/render/Resource";
import { Resource, Uuid } from "../../types";
import AdminToolbar from "../../components/admin/AdminToolbar";
import HostsTab from "../../components/admin/HostsTab";
import { deleteDeployment } from "../../api/deploy/deployments";
import { useKeycloak } from "@react-keycloak/web";
import { deleteVM } from "../../api/deploy/vms";
import { deleteGpuLease } from "../../api/deploy/gpuLeases";
import { deleteTeam } from "../../api/deploy/teams";
import TimeLeft from "../../components/admin/TimeLeft";
import {
  GpuClaimConsumer,
  GpuClaimRead,
  GpuClaimStatus,
} from "../../temporaryTypesRemoveMe";
import Iconify from "../../components/Iconify";
import Label from "../../components/Label";
import TimeAgo from "../../components/admin/TimeAgo";
import CluseterOverviewTab from "../../components/admin/ClusterOverviewTab";

export default function AdminV2() {
  const { tab: initialTab } = useParams();
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const { user, setImpersonatingDeployment, setImpersonatingVm } =
    useResource();
  const {
    fetchingEnabled,
    setEnableFetching,

    // Users
    users,
    usersFilter,
    setUsersFilter,
    filteredUsers,
    usersPage,
    setUsersPage,
    usersPageSize,
    setUsersPageSize,

    // Teams
    teams,
    teamsFilter,
    setTeamsFilter,
    filteredTeams,
    teamsPage,
    setTeamsPage,
    teamsPageSize,
    setTeamsPageSize,

    // Deployments
    deployments,
    deploymentsFilter,
    setDeploymentsFilter,
    filteredDeployments,
    deploymentsPage,
    setDeploymentsPage,
    deploymentsPageSize,
    setDeploymentsPageSize,

    // Vms
    vms,
    vmsFilter,
    setVmsFilter,
    filteredVms,
    vmsPage,
    setVmsPage,
    vmsPageSize,
    setVmsPageSize,

    // GpuLeases
    gpuLeases,
    gpuLeasesFilter,
    setGpuLeasesFilter,
    filteredGpuLeases,
    gpuLeasesPage,
    setGpuLeasesPage,
    gpuLeasesPageSize,
    setGpuLeasesPageSize,

    // GpuGroups
    gpuGroups,
    gpuGroupsFilter,
    setGpuGroupsFilter,
    filteredGpuGroups,
    gpuGroupsPage,
    setGpuGroupsPage,
    gpuGroupsPageSize,
    setGpuGroupsPageSize,

    // GpuClaims
    gpuClaims,
  } = useAdmin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleChangeTab = (_: any, newTab: number) => {
    setActiveTab(newTab);
  };

  const impersonate = (resourceType: string, id: Uuid) => {
    if (resourceType === "vm") {
      setImpersonatingVm(id);
      navigate("/edit/vm/" + id);
    } else if (resourceType === "deployment") {
      setImpersonatingDeployment(id);
      navigate("/edit/deployment/" + id);
    }
  };

  const resourceConfig = [
    {
      label: "Deployments",
      columns: [
        { id: "id", label: "ID" },
        { id: "name", label: "Deployment Name" },
        {
          id: "ownerId",
          label: "Owner",
          renderFunc: (userId: string) => {
            return users?.find((user) => user.id === userId)?.username;
          },
        },
        { id: "zone", label: "Zone" },
        { id: "image", label: "Image", or: "Custom deployment" },
        {
          id: "*",
          label: "Status",
          renderFunc: (deployment: DeploymentRead) => {
            return (
              <Stack direction="row" alignItems="center" spacing={1}>
                {renderResourceStatus(deployment as Resource, t)}
                {renderStatusCode(deployment as Resource)}
                {renderShared(deployment as Resource, t)}
                {renderStale(deployment as Resource, t)}
              </Stack>
            );
          },
        },
        { id: "visibility", label: "Visibility" },
        {
          id: "url",
          label: t("visit-page"),
          renderFunc: (value: any) => {
            if (!value) return "";
            return (
              <Link href={value} target="_blank" rel="noopener noreferrer">
                {t("visit-page")}
              </Link>
            );
          },
        },
      ],
      actions: [
        {
          label: t("button-edit"),
          onClick: (value: DeploymentRead) => {
            impersonate("deployment", value.id);
          },
        },
        {
          label: t("button-delete"),
          onClick: (deployment: DeploymentRead) => {
            if (keycloak.token) deleteDeployment(deployment.id, keycloak.token);
          },
          withConfirm: true,
        },
      ],
    },
    {
      label: "VMs",
      columns: [
        { id: "id", label: "ID" },
        { id: "name", label: "Name" },
        {
          id: "ownerId",
          label: "Owner",
          renderFunc: (userId: string) => {
            return users?.find((user) => user.id === userId)?.username;
          },
        },
        {
          id: "*",
          label: "GPUs",
          renderFunc: (vm: VmRead) =>
            renderResourceWithGPU(vm as Resource, gpuGroups!),
        },
        { id: "zone", label: "Zone" },
        { id: "host", label: "Host" },
        {
          id: "*",
          label: "Status",
          renderFunc: (vm: VmRead) => {
            return (
              <Stack direction="row" alignItems="center" spacing={1}>
                {renderResourceStatus(vm as Resource, t)}
                {renderShared(vm as Resource, t)}
                {renderStale(vm as Resource, t)}
              </Stack>
            );
          },
        },
      ],
      actions: [
        {
          label: t("button-edit"),
          onClick: (value: VmRead) => {
            impersonate("vm", value.id);
          },
        },
        {
          label: t("button-delete"),
          onClick: (vm: VmRead) => {
            if (keycloak.token) deleteVM(keycloak.token, vm.id);
          },
          withConfirm: true,
        },
      ],
    },
    {
      label: "Gpu Leases",
      columns: [
        { id: "id", label: "ID" },
        {
          id: "userId",
          label: "User",
          renderFunc: (userId: string) => {
            return users?.find((user) => user.id === userId)?.username;
          },
        },
        {
          id: "gpuGroupId",
          label: "GPU",
          renderFunc: (gpuGroupId: string) => {
            return gpuGroups?.find((gpuGroup) => gpuGroup.id === gpuGroupId)
              ?.displayName;
          },
        },
        {
          id: "queuePosition",
          label: "QueuePosition",
        },
        { id: "active", label: "Active" },
        { id: "vmId", label: "VmId", or: "N/A" },
        { id: "leaseDuration", label: "Duration" },
        {
          id: "expiresAt",
          label: "Expiry",
          renderFunc: (expiresAt: string) => (
            <TimeLeft targetDate={expiresAt} />
          ),
        },
      ],
      actions: [
        {
          label: t("button-delete"),
          onClick: (gpuLease: GpuLeaseRead) => {
            if (keycloak.token) deleteGpuLease(keycloak.token, gpuLease.id);
          },
          withConfirm: true,
        },
      ],
    },
    {
      label: "GPU Groups",
      columns: [
        { id: "id", label: "ID" },
        { id: "name", label: "Name" },
        { id: "displayName", label: "Display Name" },
        { id: "zone", label: "Zone" },
        { id: "vendor", label: "Vendor" },
        {
          id: "*",
          label: "Available",
          renderFunc: (gpuGroup: GpuGroupRead) =>
            `${gpuGroup.available} / ${gpuGroup.total}`,
        },
      ],
      actions: [
        {
          label: "Leases",
          onClick: (gpuGroup: GpuGroupRead) => {
            setGpuLeasesFilter(gpuGroup.id);
            setActiveTab(2);
          },
        },
      ],
    },
    {
      label: "GPU Claims",
      columns: [
        { id: "id", label: "ID" },
        { id: "name", label: "Name" },
        { id: "zone", label: "Zone" },
        {
          id: "*",
          label: "Requested",
          renderFunc: (claim: GpuClaimRead | undefined) => {
            const requested = claim?.requested;
            const allocated = claim?.allocated;

            if (!requested || Object.keys(requested).length === 0) {
              return (
                <Typography variant="body2" color="text.secondary">
                  {t("gpuclaim-no-gpu-requested")}
                </Typography>
              );
            }

            return (
              <Stack direction="column" spacing={0.5}>
                {Object.entries(requested).map(([name, req]) => {
                  const allocs = allocated?.[name];
                  const vendor =
                    (req.config as any)?.type ||
                    (req.config as any)?.driver ||
                    "unknown";
                  const sharing = (req.config as any)?.parameters?.sharing
                    ?.strategy;
                  const sharingConfig = vendor?.toLowerCase().includes("nvidia")
                    ? sharing?.includes("MPS")
                      ? (req.config as any)?.parameters?.mpsConfig
                      : (req.config as any)?.parameters?.timeslicingConfig
                    : undefined;
                  const allocatedChip = allocs ? (
                    <Stack>
                      {allocs.map((alloc) => (
                        <Chip
                          variant="outlined"
                          label={`Allocated (${alloc.pool}/${alloc.device})`}
                          color="success"
                          size="small"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Chip
                      variant="outlined"
                      label="Not allocated"
                      color="default"
                      size="small"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  );

                  return (
                    <Box
                      key={name}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 0.8,
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Label
                          variant="ghost"
                          //fontWeight={600}
                          startIcon={
                            <Iconify
                              icon="mdi:gpu"
                              width={20}
                              height={20}
                              sx={{ opacity: 0.65 }}
                            />
                          }
                        >
                          {name}
                        </Label>
                        {allocatedChip}
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.3 }}
                      >
                        {req.count} {vendor} {sharing && `• ${sharing}`}{" "}
                        {sharingConfig && `• ${sharingConfig}`}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            );
          },
        },
        {
          id: "consumers",
          label: "Consumers",
          renderFunc: (consumers: GpuClaimConsumer[] | undefined) => {
            if (consumers == undefined) return <></>;
            return (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ maxWidth: 220 }}
              >
                {consumers.map((c) => (
                  <Chip
                    key={c.name}
                    label={c.name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                ))}
              </Stack>
            );
          },
        },
        {
          id: "status",
          label: "Status",
          renderFunc: (status: GpuClaimStatus) => {
            const phase = status?.phase?.toLowerCase();

            let color = "default";
            if (phase === "bound") color = "success";
            else if (phase === "pending") color = "info";
            else if (phase === "failed") color = "error";

            return (
              <Stack direction="column" alignItems={"center"}>
                <Chip
                  label={phase || "unknown"}
                  color={color}
                  variant="outlined"
                  size="small"
                />
                {status?.lastSynced != undefined && (
                  <TimeAgo variant={"caption"} createdAt={status.lastSynced} />
                )}
              </Stack>
            );
          },
        },
      ],
    },
    {
      label: "Users",
      columns: [
        { id: "id", label: "ID" },
        { id: "username", label: "Username" },
        { id: "email", label: "Email" },
        { id: "role.name", label: "Role" },
        { id: "admin", label: "Admin" },
        {
          id: "*",
          label: "Usage",
          renderFunc: (user: UserRead) => {
            if (!user || !user.usage || !user.quota) return "N/A";

            const calculatePercentage = (used: number, total: number) =>
              total ? ((used / total) * 100).toFixed(1) : "0.0";

            const { cpu, ram, disk } = {
              cpu: calculatePercentage(
                user.usage.cpuCores,
                user.quota.cpuCores
              ),
              ram: calculatePercentage(user.usage.ram, user.quota.ram),
              disk: calculatePercentage(
                user.usage.diskSize,
                user.quota.diskSize
              ),
            };

            return (
              <div style={{ minWidth: 150 }}>
                <Typography variant="body2">CPU</Typography>
                <Tooltip
                  title={`${user.usage.cpuCores} of ${user.quota.cpuCores} cores (${cpu}%)`}
                >
                  <LinearProgress variant="determinate" value={Number(cpu)} />
                </Tooltip>

                <Typography variant="body2">RAM</Typography>
                <Tooltip
                  title={`${user.usage.ram} of ${user.quota.ram} GB (${ram}%)`}
                >
                  <LinearProgress variant="determinate" value={Number(ram)} />
                </Tooltip>

                <Typography variant="body2">Disk</Typography>
                <Tooltip
                  title={`${user.usage.diskSize} of ${user.quota.diskSize} GB (${disk}%)`}
                >
                  <LinearProgress variant="determinate" value={Number(disk)} />
                </Tooltip>
              </div>
            );
          },
        },
      ],
      actions: [
        {
          label: "Deployments",
          onClick: (user: UserRead) => {
            setDeploymentsFilter(user.id);
            setActiveTab(0);
          },
        },
        {
          label: "VMs",
          onClick: (user: UserRead) => {
            setVmsFilter(user.id);
            setActiveTab(1);
          },
        },
        {
          label: "Teams",
          onClick: (user: UserRead) => {
            setTeamsFilter(user.id);
            setActiveTab(5);
          },
        },
        {
          label: "Open Keycloak",
          onClick: (user: UserRead) => {
            const userUrl = `${import.meta.env.VITE_KEYCLOAK_URL}/admin/master/console/#/${import.meta.env.VITE_KEYCLOAK_REALM}/users/${user.id}/settings`;
            window.open(userUrl, "_blank");
          },
        },
      ],
    },
    {
      label: "Teams",
      columns: [
        { id: "id", label: "ID" },
        { id: "name", label: "Team Name" },
        {
          id: "members",
          label: "Members",
          renderFunc: (members: { username: string }[]) =>
            members.map((member) => member.username).join(", "),
        },
        {
          id: "resources",
          label: "Resources",
          renderFunc: (resources: { name: string; type: string }[]) => {
            const deploymentCount = resources.filter(
              (resource) => resource.type === "deployment"
            ).length;
            const vmCount = resources.filter(
              (resource) => resource.type === "vm"
            ).length;

            return `${deploymentCount} Depls, ${vmCount} VMs`;
          },
        },
      ],
      actions: [
        {
          label: t("button-delete"),
          onClick: (team: TeamRead) => {
            if (keycloak.token) deleteTeam(keycloak.token!, team.id);
          },
          withConfirm: true,
        },
      ],
    },
  ];

  const tabLookup = resourceConfig.reduce<Record<string, number>>(
    (acc, obj, index) => {
      acc[obj.label.toLowerCase()] = index;
      return acc;
    },
    {}
  );
  tabLookup["hosts"] = resourceConfig.length;
  tabLookup["overview"] = resourceConfig.length + 1;
  useEffect(() => {
    if (
      initialTab &&
      tabLookup[initialTab.toLowerCase()] &&
      tabLookup[initialTab.toLowerCase()] !== activeTab
    ) {
      setActiveTab(tabLookup[initialTab.toLowerCase()]);
    }
  }, []);

  const resourceLookup = [
    {
      data: deployments,
      filter: deploymentsFilter,
      setFilter: setDeploymentsFilter,
      filteredData: filteredDeployments,
      page: deploymentsPage,
      setPage: setDeploymentsPage,
      pageSize: deploymentsPageSize,
      setPageSize: setDeploymentsPageSize,
    },
    {
      data: vms,
      filter: vmsFilter,
      setFilter: setVmsFilter,
      filteredData: filteredVms,
      page: vmsPage,
      setPage: setVmsPage,
      pageSize: vmsPageSize,
      setPageSize: setVmsPageSize,
    },
    {
      data: gpuLeases,
      filter: gpuLeasesFilter,
      setFilter: setGpuLeasesFilter,
      filteredData: filteredGpuLeases,
      page: gpuLeasesPage,
      setPage: setGpuLeasesPage,
      pageSize: gpuLeasesPageSize,
      setPageSize: setGpuLeasesPageSize,
    },
    {
      data: gpuGroups,
      filter: gpuGroupsFilter,
      setFilter: setGpuGroupsFilter,
      filteredData: filteredGpuGroups,
      page: gpuGroupsPage,
      setPage: setGpuGroupsPage,
      pageSize: gpuGroupsPageSize,
      setPageSize: setGpuGroupsPageSize,
    },
    {
      data: gpuClaims,
      setFilter: () => {},
      page: 0,
      setPage: () => {},
      pageSize: gpuClaims?.length || 0,
      setPageSize: () => {},
    },
    {
      data: users,
      filter: usersFilter,
      setFilter: setUsersFilter,
      filteredData: filteredUsers,
      page: usersPage,
      setPage: setUsersPage,
      pageSize: usersPageSize,
      setPageSize: setUsersPageSize,
    },
    {
      data: teams,
      filter: teamsFilter,
      setFilter: setTeamsFilter,
      filteredData: filteredTeams,
      page: teamsPage,
      setPage: setTeamsPage,
      pageSize: teamsPageSize,
      setPageSize: setTeamsPageSize,
    },
  ];

  useEffect(() => {
    if (!user) return;
    if (!user.admin) {
      enqueueSnackbar("Cannot access admin panel: Unauthorized", {
        variant: "error",
      });
      navigate("/deploy");
    }
  }, [user]);

  useEffect(() => {
    if (!fetchingEnabled) {
      setEnableFetching(true);
    }
    return () => {
      if (fetchingEnabled) {
        setEnableFetching(false);
      }
    };
  }, []);

  const tabs = [
    ...resourceConfig.map((config, index) => (
      <ResourceTab<any>
        key={index}
        resourceName={config.label}
        data={resourceLookup[index].data}
        filteredData={resourceLookup[index].filteredData}
        filter={resourceLookup[index].filter}
        setFilter={resourceLookup[index].setFilter}
        columns={config.columns}
        actions={config.actions}
        page={resourceLookup[index].page}
        setPage={resourceLookup[index].setPage}
        pageSize={resourceLookup[index].pageSize}
        setPageSize={resourceLookup[index].setPageSize}
      />
    )),
    <HostsTab />,
    <CluseterOverviewTab />,
  ];

  useEffect(() => {
    const path = `/admin/${activeTab < resourceConfig.length ? resourceConfig[activeTab].label.toLowerCase() : "hosts"}`;

    if (window.location.pathname !== path) {
      navigate(path);
    }
  }, [activeTab]);

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title={t("admin-title")}>
          <AdminToolbar />

          <Container maxWidth="xl">
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("menu-admin-panel")}
              </Typography>
              <Card sx={{ boxShadow: 20 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleChangeTab}
                  variant="scrollable"
                >
                  {resourceConfig.map((resource, index) => (
                    <Tab key={index} label={resource.label} />
                  ))}
                  <Tab key={resourceConfig.length} label={t("hosts")} />
                  <Tab key={resourceConfig.length + 1} label={t("overview")} />
                </Tabs>
                {tabs[activeTab]}
              </Card>
            </Stack>
          </Container>
        </Page>
      )}
    </>
  );
}
