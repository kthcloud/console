import {
  AppBar,
  Box,
  Button,
  Card,
  Container,
  LinearProgress,
  Link,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import useResource from "../../hooks/useResource";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import useAdmin from "../../hooks/useAdmin";
import LoadingPage from "../../components/LoadingPage";
import Page from "../../components/Page";
import ResourceTab from "../../components/admin/ResourceTab";
import {
  DeploymentRead,
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

export default function AdminV2() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, setImpersonatingDeployment, setImpersonatingVm } =
    useResource();
  const {
    fetchingEnabled,
    setEnableFetching,
    lastRefreshRtt,
    timeDiffSinceLastRefresh,
    loading,
    refetch,
    users,
    usersFilter,
    setUsersFilter,
    filteredUsers,
    teams,
    teamsFilter,
    setTeamsFilter,
    filteredTeams,
    deployments,
    deploymentsFilter,
    setDeploymentsFilter,
    filteredDeployments,
    vms,
    vmsFilter,
    setVmsFilter,
    filteredVms,
    gpuLeases,
    gpuLeasesFilter,
    setGpuLeasesFilter,
    filteredGpuLeases,
    gpuGroups,
    gpuGroupsFilter,
    setGpuGroupsFilter,
    filteredGpuGroups,
    jobs,
    jobsFilter,
    setJobsFilter,
    filteredJobs,
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
          onClick: (_: DeploymentRead) => {},
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
          onClick: (_: VmRead) => {},
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
        { id: "active", label: "Active" },
        { id: "vmId", label: "VmId", or: "N/A" },
        { id: "leaseDuration", label: "Duration" },
      ],
      actions: [
        {
          label: t("button-delete"),
          onClick: (_: GpuLeaseRead) => {},
          withConfirm: true,
        },
      ],
    },
    {
      label: "Gpu Groups",
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
              <Box sx={{ minWidth: 150 }}>
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
                  title={`${user.usage.cpuCores} of ${user.quota.cpuCores} GB (${disk}%)`}
                >
                  <LinearProgress variant="determinate" value={Number(disk)} />
                </Tooltip>
              </Box>
            );
          },
        },
      ],
      actions: [{ label: "test", onClick: (_: UserRead) => {} }],
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
        { label: t("button-edit"), onClick: (_: TeamRead) => {} },
        {
          label: t("button-delete"),
          onClick: (_: TeamRead) => {},
          withConfirm: true,
        },
      ],
    },
    {
      label: "Jobs",
    },
  ];

  const resourceLookup = [
    {
      data: deployments,
      filter: deploymentsFilter,
      setFilter: setDeploymentsFilter,
      filteredData: filteredDeployments,
    },
    {
      data: vms,
      filter: vmsFilter,
      setFilter: setVmsFilter,
      filteredData: filteredVms,
    },
    {
      data: gpuLeases,
      filter: gpuLeasesFilter,
      setFilter: setGpuLeasesFilter,
      filteredData: filteredGpuLeases,
    },
    {
      data: gpuGroups,
      filter: gpuGroupsFilter,
      setFilter: setGpuGroupsFilter,
      filteredData: filteredGpuGroups,
    },
    {
      data: users,
      filter: usersFilter,
      setFilter: setUsersFilter,
      filteredData: filteredUsers,
    },
    {
      data: teams,
      filter: teamsFilter,
      setFilter: setTeamsFilter,
      filteredData: filteredTeams,
    },
    {
      data: jobs,
      filter: jobsFilter,
      setFilter: setJobsFilter,
      filteredData: filteredJobs,
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

  const tabs = resourceConfig.map((config, index) => (
    <ResourceTab<any> // Todo
      key={index}
      resourceName={config.label}
      data={resourceLookup[index].data}
      filteredData={resourceLookup[index].filteredData}
      filter={resourceLookup[index].filter}
      setFilter={resourceLookup[index].setFilter}
      columns={config.columns}
      actions={config.actions}
    />
  ));

  return (
    <>
      {!user ? (
        <LoadingPage />
      ) : (
        <Page title={t("admin-title")}>
          <AppBar
            position="fixed"
            color="inherit"
            sx={{
              top: "auto",
              bottom: 0,
              borderTop: 1,
              borderColor: theme.palette.grey[300],
            }}
          >
            <Toolbar>
              <Typography variant="h4">{t("admin-title")}</Typography>
              <Box component="div" sx={{ flexGrow: 1 }} />
              <Stack direction="row" alignItems={"center"} spacing={3}>
                <Button variant="contained" onClick={refetch}>
                  {t("admin-refresh-resources")}
                </Button>
                <Typography variant="body1">
                  {loading ? (
                    t("loading")
                  ) : (
                    <span>
                      RTT:
                      <span style={{ fontFamily: "monospace" }}>
                        {" " + lastRefreshRtt + " ms "}
                      </span>
                      {t("admin-last-load")}:
                      <span style={{ fontFamily: "monospace" }}>
                        {" " + timeDiffSinceLastRefresh}
                      </span>
                    </span>
                  )}
                </Typography>
              </Stack>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl">
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                {t("menu-admin-panel")}
              </Typography>
              <Card sx={{ boxShadow: 20 }}>
                <Tabs value={activeTab} onChange={handleChangeTab}>
                  {resourceConfig.map((resource, index) => (
                    <Tab key={index} label={resource.label} />
                  ))}
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
