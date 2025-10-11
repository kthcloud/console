import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import useInterval from "../hooks/useInterval";
import {
  DeploymentRead,
  GpuGroupRead,
  GpuLeaseRead,
  HostVerboseRead,
  JobRead,
  SystemCapacities,
  TeamRead,
  UserRead,
  VmRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import useFilterableResourceState, {
  DEFAULT_PAGESIZE,
} from "../hooks/useFilterableResourceState";
import { useKeycloak } from "@react-keycloak/web";
import { getUsers } from "../api/deploy/users";
import { errorHandler } from "../utils/errorHandler";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { listVMs } from "../api/deploy/vms";
import { getDeployments } from "../api/deploy/deployments";
import { listGpuLeases } from "../api/deploy/gpuLeases";
import { listGpuGroups } from "../api/deploy/gpuGroups";
import { getTeams } from "../api/deploy/teams";
import { getJobs } from "../api/deploy/jobs";
import useResource from "../hooks/useResource";
import { TFunction } from "i18next";
import { getHostsVerbose } from "../api/deploy/hosts";
import { getSystemCapacities } from "../api/deploy/systemCapacities";

type AdminResourceContextType = {
  fetchingEnabled: boolean;
  setEnableFetching: Dispatch<SetStateAction<boolean>>;
  lastRefresh: number;
  lastRefreshRtt: number;
  loading: boolean;
  refetch: () => void;
  // Users
  users: UserRead[] | undefined;
  usersFilter: string | undefined;
  setUsersFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredUsers: UserRead[] | undefined;
  usersPage: number;
  setUsersPage: Dispatch<SetStateAction<number>>;
  usersPageSize: number;
  setUsersPageSize: Dispatch<SetStateAction<number>>;

  // Teams
  teams: TeamRead[] | undefined;
  teamsFilter: string | undefined;
  setTeamsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredTeams: TeamRead[] | undefined;
  teamsPage: number;
  setTeamsPage: Dispatch<SetStateAction<number>>;
  teamsPageSize: number;
  setTeamsPageSize: Dispatch<SetStateAction<number>>;

  // Deployments
  deployments: DeploymentRead[] | undefined;
  deploymentsFilter: string | undefined;
  setDeploymentsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredDeployments: DeploymentRead[] | undefined;
  deploymentsPage: number;
  setDeploymentsPage: Dispatch<SetStateAction<number>>;
  deploymentsPageSize: number;
  setDeploymentsPageSize: Dispatch<SetStateAction<number>>;

  // Vms
  vms: VmRead[] | undefined;
  vmsFilter: string | undefined;
  setVmsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredVms: VmRead[] | undefined;
  vmsPage: number;
  setVmsPage: Dispatch<SetStateAction<number>>;
  vmsPageSize: number;
  setVmsPageSize: Dispatch<SetStateAction<number>>;

  // GpuLeases
  gpuLeases: GpuLeaseRead[] | undefined;
  gpuLeasesFilter: string | undefined;
  setGpuLeasesFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredGpuLeases: GpuLeaseRead[] | undefined;
  gpuLeasesPage: number;
  setGpuLeasesPage: Dispatch<SetStateAction<number>>;
  gpuLeasesPageSize: number;
  setGpuLeasesPageSize: Dispatch<SetStateAction<number>>;

  // GpuGroups
  gpuGroups: GpuGroupRead[] | undefined;
  gpuGroupsFilter: string | undefined;
  setGpuGroupsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredGpuGroups: GpuGroupRead[] | undefined;
  gpuGroupsPage: number;
  setGpuGroupsPage: Dispatch<SetStateAction<number>>;
  gpuGroupsPageSize: number;
  setGpuGroupsPageSize: Dispatch<SetStateAction<number>>;

  // Jobs
  jobs: JobRead[] | undefined;
  jobsFilter: string | undefined;
  setJobsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredJobs: JobRead[] | undefined;
  jobsPage: number;
  setJobsPage: Dispatch<SetStateAction<number>>;
  jobsPageSize: number;
  setJobsPageSize: Dispatch<SetStateAction<number>>;

  // Hosts
  hosts: HostVerboseRead[] | undefined;

  // SystemCapacities
  systemCapacities: SystemCapacities | undefined;
};

const initialState: AdminResourceContextType = {
  fetchingEnabled: false,
  setEnableFetching: () => {},
  lastRefresh: 0,
  lastRefreshRtt: 0,
  loading: false,
  refetch: () => {},
  // Users
  users: undefined,
  usersFilter: undefined,
  setUsersFilter: () => {},
  filteredUsers: undefined,
  usersPage: 0,
  setUsersPage: () => {},
  usersPageSize: DEFAULT_PAGESIZE,
  setUsersPageSize: () => {},

  // Teams
  teams: undefined,
  teamsFilter: undefined,
  setTeamsFilter: () => {},
  filteredTeams: undefined,
  teamsPage: 0,
  setTeamsPage: () => {},
  teamsPageSize: DEFAULT_PAGESIZE,
  setTeamsPageSize: () => {},

  // Deployments
  deployments: undefined,
  deploymentsFilter: undefined,
  setDeploymentsFilter: () => {},
  filteredDeployments: undefined,
  deploymentsPage: 0,
  setDeploymentsPage: () => {},
  deploymentsPageSize: DEFAULT_PAGESIZE,
  setDeploymentsPageSize: () => {},

  // Vms
  vms: undefined,
  vmsFilter: undefined,
  setVmsFilter: () => {},
  filteredVms: undefined,
  vmsPage: 0,
  setVmsPage: () => {},
  vmsPageSize: DEFAULT_PAGESIZE,
  setVmsPageSize: () => {},

  // GpuLeases
  gpuLeases: undefined,
  gpuLeasesFilter: undefined,
  setGpuLeasesFilter: () => {},
  filteredGpuLeases: undefined,
  gpuLeasesPage: 0,
  setGpuLeasesPage: () => {},
  gpuLeasesPageSize: DEFAULT_PAGESIZE,
  setGpuLeasesPageSize: () => {},

  // GpuGroups
  gpuGroups: undefined,
  gpuGroupsFilter: undefined,
  setGpuGroupsFilter: () => {},
  filteredGpuGroups: undefined,
  gpuGroupsPage: 0,
  setGpuGroupsPage: () => {},
  gpuGroupsPageSize: DEFAULT_PAGESIZE,
  setGpuGroupsPageSize: () => {},

  // Jobs
  jobs: undefined,
  jobsFilter: undefined,
  setJobsFilter: () => {},
  filteredJobs: undefined,
  jobsPage: 0,
  setJobsPage: () => {},
  jobsPageSize: DEFAULT_PAGESIZE,
  setJobsPageSize: () => {},

  // Hosts
  hosts: undefined,

  // SystemCapacities
  systemCapacities: undefined,
};

export const AdminResourceContext = createContext(initialState);

export const AdminResourceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    items: users,
    setItems: setUsers,
    filter: usersFilter,
    setFilter: setUsersFilter,
    filteredItems: filteredUsers,
    page: usersPage,
    setPage: setUsersPage,
    pageSize: usersPageSize,
    setPageSize: setUsersPageSize,
  } = useFilterableResourceState<UserRead>(undefined);
  const {
    items: teams,
    setItems: setTeams,
    filter: teamsFilter,
    setFilter: setTeamsFilter,
    filteredItems: filteredTeams,
    page: teamsPage,
    setPage: setTeamsPage,
    pageSize: teamsPageSize,
    setPageSize: setTeamsPageSize,
  } = useFilterableResourceState<TeamRead>(undefined);
  const {
    items: deployments,
    setItems: setDeployments,
    filter: deploymentsFilter,
    setFilter: setDeploymentsFilter,
    filteredItems: filteredDeployments,
    page: deploymentsPage,
    setPage: setDeploymentsPage,
    pageSize: deploymentsPageSize,
    setPageSize: setDeploymentsPageSize,
  } = useFilterableResourceState<DeploymentRead>(undefined);
  const {
    items: vms,
    setItems: setVms,
    filter: vmsFilter,
    setFilter: setVmsFilter,
    filteredItems: filteredVms,
    page: vmsPage,
    setPage: setVmsPage,
    pageSize: vmsPageSize,
    setPageSize: setVmsPageSize,
  } = useFilterableResourceState<VmRead>(undefined);
  const {
    items: gpuLeases,
    setItems: setGpuLeases,
    filter: gpuLeasesFilter,
    setFilter: setGpuLeasesFilter,
    filteredItems: filteredGpuLeases,
    page: gpuLeasesPage,
    setPage: setGpuLeasesPage,
    pageSize: gpuLeasesPageSize,
    setPageSize: setGpuLeasesPageSize,
  } = useFilterableResourceState<GpuLeaseRead>(undefined);
  const {
    items: gpuGroups,
    setItems: setGpuGroups,
    filter: gpuGroupsFilter,
    setFilter: setGpuGroupsFilter,
    filteredItems: filteredGpuGroups,
    page: gpuGroupsPage,
    setPage: setGpuGroupsPage,
    pageSize: gpuGroupsPageSize,
    setPageSize: setGpuGroupsPageSize,
  } = useFilterableResourceState<GpuGroupRead>(undefined);
  const {
    items: jobs,
    setItems: setJobs,
    filter: jobsFilter,
    setFilter: setJobsFilter,
    filteredItems: filteredJobs,
    page: jobsPage,
    setPage: setJobsPage,
    pageSize: jobsPageSize,
    setPageSize: setJobsPageSize,
  } = useFilterableResourceState<JobRead>(undefined);

  const [hosts, setHosts] = useState<HostVerboseRead[] | undefined>(undefined);

  const [systemCapacities, setSystemCapacities] = useState<
    SystemCapacities | undefined
  >(undefined);

  const [lastRefreshRtt, setLastRefreshRtt] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const { user } = useResource();

  const [fetchingEnabled, setEnableFetching] = useState<boolean>(false);

  const getResources = () => {
    if (!loading) {
      setLoading(true);
      fetchResources(
        keycloak,
        initialized,
        t,
        setLastRefresh,
        setLastRefreshRtt,
        usersPage,
        usersPageSize,
        setUsers,
        teamsPage,
        teamsPageSize,
        setTeams,
        deploymentsPage,
        deploymentsPageSize,
        setDeployments,
        vmsPage,
        vmsPageSize,
        setVms,
        gpuLeasesPage,
        gpuLeasesPageSize,
        setGpuLeases,
        gpuGroupsPage,
        gpuGroupsPageSize,
        setGpuGroups,
        jobsPage,
        jobsPageSize,
        setJobs,
        setHosts,
        setSystemCapacities
      ).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (
      initialized &&
      keycloak.authenticated &&
      user &&
      user.admin &&
      fetchingEnabled &&
      users === undefined
    ) {
      getResources();
    }
  }, [keycloak, initialized, user]);

  useInterval(() => {
    if (
      initialized &&
      keycloak.authenticated &&
      user &&
      user.admin &&
      fetchingEnabled
    ) {
      getResources();
    }
  }, 60000);

  return (
    <AdminResourceContext.Provider
      value={{
        fetchingEnabled,
        setEnableFetching,
        lastRefresh,
        lastRefreshRtt,
        loading,
        refetch: () => {
          if (initialized && keycloak.authenticated && user && user.admin) {
            getResources();
            if (!fetchingEnabled) {
              setEnableFetching(true);
            }
          }
        },

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

        // Jobs
        jobs,
        jobsFilter,
        setJobsFilter,
        filteredJobs,
        jobsPage,
        setJobsPage,
        jobsPageSize,
        setJobsPageSize,

        // Hosts
        hosts,

        // SystemCapacities
        systemCapacities,
      }}
    >
      {children}
    </AdminResourceContext.Provider>
  );
};

async function fetchResources(
  keycloak: any,
  initialized: boolean,
  t: TFunction<"translation", undefined>,
  setLastRefresh: Dispatch<SetStateAction<number>>,
  setLastRefreshRtt: Dispatch<SetStateAction<number>>,

  // Users
  __usersPage: number,
  __usersPageSize: number,
  setUsers: Dispatch<SetStateAction<UserRead[] | undefined>>,

  // Teams
  __teamsPage: number,
  __teamsPageSize: number,
  setTeams: Dispatch<SetStateAction<TeamRead[] | undefined>>,

  // Deployments
  __deploymentsPage: number,
  __deploymentsPageSize: number,
  setDeployments: Dispatch<SetStateAction<DeploymentRead[] | undefined>>,

  // Vms
  __vmsPage: number,
  __vmsPageSize: number,
  setVms: Dispatch<SetStateAction<VmRead[] | undefined>>,

  // GpuLeases
  __gpuLeases: number,
  __gpuLeasesPage: number,
  setGpuLeases: Dispatch<SetStateAction<GpuLeaseRead[] | undefined>>,

  // GpuGroups
  __gpuGroups: number,
  __gpuGroupsPageSize: number,
  setGpuGroups: Dispatch<SetStateAction<GpuGroupRead[] | undefined>>,

  // Jobs
  __jobsPage: number,
  __jobsPageSize: number,
  setJobs: Dispatch<SetStateAction<JobRead[] | undefined>>,

  // Hosts
  setHosts: Dispatch<SetStateAction<HostVerboseRead[] | undefined>>,

  // SystemCapacities
  setSystemCapacities: Dispatch<SetStateAction<SystemCapacities | undefined>>
) {
  if (!(initialized && keycloak.authenticated && keycloak.token)) return;
  const rtts: Record<number, { start: number; end: number }> = {};
  const promises = [
    async () => {
      try {
        const start = performance.now();
        const response = await getUsers(keycloak.token!, {
          all: true,
        });
        rtts[0] = { start, end: performance.now() };
        setUsers(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-users") + ": " + e, {
            variant: "error",
          })
        );
      }
    },

    async () => {
      try {
        const start = performance.now();
        const response = await listVMs(keycloak.token!, true);
        rtts[1] = { start, end: performance.now() };
        setVms(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-vms") + ": " + e, {
            variant: "error",
          })
        );
      }
    },
    async () => {
      try {
        const start = performance.now();
        const response = await getDeployments(keycloak.token!, true);
        rtts[2] = { start, end: performance.now() };
        setDeployments(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-deployments") + ": " + e, {
            variant: "error",
          })
        );
      }
    },
    async () => {
      try {
        const start = performance.now();
        const response = await listGpuLeases(keycloak.token!, undefined, true);
        rtts[3] = { start, end: performance.now() };
        setGpuLeases(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-gpus") + ": " + e, {
            variant: "error",
          })
        );
      }
    },
    async () => {
      try {
        const start = performance.now();
        const response = await listGpuGroups(keycloak.token!, undefined);
        rtts[4] = { start, end: performance.now() };
        setGpuGroups(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-gpus") + ": " + e, {
            variant: "error",
          })
        );
      }
    },
    async () => {
      try {
        const start = performance.now();
        const response = await getTeams(keycloak.token!, true);
        rtts[5] = { start, end: performance.now() };
        setTeams(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-teams") + ": " + e, {
            variant: "error",
          })
        );
      }
    },

    async () => {
      try {
        const start = performance.now();
        const response = await getJobs(
          keycloak.token!,
          undefined,
          undefined,
          true
        );
        rtts[6] = { start, end: performance.now() };
        setJobs(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-jobs") + ": " + e, {
            variant: "error",
          })
        );
      }
    },

    async () => {
      try {
        const start = performance.now();
        const response = await getHostsVerbose(keycloak.token!);
        rtts[7] = { start, end: performance.now() };
        setHosts(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-hosts") + ": " + e, {
            variant: "error",
          })
        );
      }
    },

    async () => {
      try {
        const start = performance.now();
        const response = await getSystemCapacities(keycloak.token!);
        rtts[8] = { start, end: performance.now() };
        if (response) setSystemCapacities(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(
            t("error-could-not-fetch-system-capacities") + ": " + e,
            {
              variant: "error",
            }
          )
        );
      }
    },
  ];

  await Promise.all(promises.map((p) => p()));

  const rttValues = Object.values(rtts).map(({ start, end }) => end - start);
  const averageRtt =
    rttValues.length > 0
      ? rttValues.reduce((sum, rtt) => sum + rtt, 0) / rttValues.length
      : 0;

  // end timer and set last refresh, show in ms
  setLastRefresh(new Date().getTime());
  setLastRefreshRtt(averageRtt);
}
