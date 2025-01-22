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
  JobRead,
  TeamRead,
  UserRead,
  VmRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import useFilterableResourceState from "../hooks/useFilterableResourceState";
import { useKeycloak } from "@react-keycloak/web";
import { getAllUsers } from "../api/deploy/users";
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

type AdminResourceContextType = {
  fetchingEnabled: boolean;
  setEnableFetching: Dispatch<SetStateAction<boolean>>;
  lastRefresh: number;
  lastRefreshRtt: number;
  timeDiffSinceLastRefresh: string;
  loading: boolean;
  refetch: () => void;
  users: UserRead[] | undefined;
  usersFilter: string | undefined;
  setUsersFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredUsers: UserRead[] | undefined;
  teams: TeamRead[] | undefined;
  teamsFilter: string | undefined;
  setTeamsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredTeams: TeamRead[] | undefined;
  deployments: DeploymentRead[] | undefined;
  deploymentsFilter: string | undefined;
  setDeploymentsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredDeployments: DeploymentRead[] | undefined;
  vms: VmRead[] | undefined;
  vmsFilter: string | undefined;
  setVmsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredVms: VmRead[] | undefined;
  gpuLeases: GpuLeaseRead[] | undefined;
  gpuLeasesFilter: string | undefined;
  setGpuLeasesFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredGpuLeases: GpuLeaseRead[] | undefined;
  gpuGroups: GpuGroupRead[] | undefined;
  gpuGroupsFilter: string | undefined;
  setGpuGroupsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredGpuGroups: GpuGroupRead[] | undefined;
  jobs: JobRead[] | undefined;
  jobsFilter: string | undefined;
  setJobsFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredJobs: JobRead[] | undefined;
};

const initialState: AdminResourceContextType = {
  fetchingEnabled: false,
  setEnableFetching: () => {},
  lastRefresh: 0,
  lastRefreshRtt: 0,
  timeDiffSinceLastRefresh: "",
  loading: false,
  refetch: () => {},
  users: undefined,
  usersFilter: undefined,
  setUsersFilter: () => {},
  filteredUsers: undefined,
  teams: undefined,
  teamsFilter: undefined,
  setTeamsFilter: () => {},
  filteredTeams: undefined,
  deployments: undefined,
  deploymentsFilter: undefined,
  setDeploymentsFilter: () => {},
  filteredDeployments: undefined,
  vms: undefined,
  vmsFilter: undefined,
  setVmsFilter: () => {},
  filteredVms: undefined,
  gpuLeases: undefined,
  gpuLeasesFilter: undefined,
  setGpuLeasesFilter: () => {},
  filteredGpuLeases: undefined,
  gpuGroups: undefined,
  gpuGroupsFilter: undefined,
  setGpuGroupsFilter: () => {},
  filteredGpuGroups: undefined,
  jobs: undefined,
  jobsFilter: undefined,
  setJobsFilter: () => {},
  filteredJobs: undefined,
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
  } = useFilterableResourceState<UserRead>(undefined);
  const {
    items: teams,
    setItems: setTeams,
    filter: teamsFilter,
    setFilter: setTeamsFilter,
    filteredItems: filteredTeams,
  } = useFilterableResourceState<TeamRead>(undefined);
  const {
    items: deployments,
    setItems: setDeployments,
    filter: deploymentsFilter,
    setFilter: setDeploymentsFilter,
    filteredItems: filteredDeployments,
  } = useFilterableResourceState<DeploymentRead>(undefined);
  const {
    items: vms,
    setItems: setVms,
    filter: vmsFilter,
    setFilter: setVmsFilter,
    filteredItems: filteredVms,
  } = useFilterableResourceState<VmRead>(undefined);
  const {
    items: gpuLeases,
    setItems: setGpuLeases,
    filter: gpuLeasesFilter,
    setFilter: setGpuLeasesFilter,
    filteredItems: filteredGpuLeases,
  } = useFilterableResourceState<GpuLeaseRead>(undefined);
  const {
    items: gpuGroups,
    setItems: setGpuGroups,
    filter: gpuGroupsFilter,
    setFilter: setGpuGroupsFilter,
    filteredItems: filteredGpuGroups,
  } = useFilterableResourceState<GpuGroupRead>(undefined);
  const {
    items: jobs,
    setItems: setJobs,
    filter: jobsFilter,
    setFilter: setJobsFilter,
    filteredItems: filteredJobs,
  } = useFilterableResourceState<JobRead>(undefined);

  const [lastRefreshRtt, setLastRefreshRtt] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [timeDiffSinceLastRefresh, setTimeDiffSinceLastRefresh] = useState("");
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
        setUsers,
        setTeams,
        setDeployments,
        setVms,
        setGpuLeases,
        setGpuGroups,
        setJobs
      ).finally(() => setLoading(false));
    }
  };

  useInterval(() => {
    const now = new Date().getTime();
    const diff = now - lastRefresh;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      setTimeDiffSinceLastRefresh(hours + " " + t("time-hours-ago"));
      return;
    }
    if (minutes > 0) {
      setTimeDiffSinceLastRefresh(minutes + " " + t("time-minutes-ago"));
      return;
    }

    if (seconds > 0) {
      setTimeDiffSinceLastRefresh(seconds + " " + t("time-seconds-ago"));
      return;
    }

    setTimeDiffSinceLastRefresh("0 " + t("time-seconds-ago"));
  }, 1000);

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
        timeDiffSinceLastRefresh,
        loading,
        refetch: () => {
          if (initialized && keycloak.authenticated && user && user.admin) {
            getResources();
            if (!fetchingEnabled) {
              setEnableFetching(true);
            }
          }
        },
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
  setUsers: Dispatch<SetStateAction<UserRead[] | undefined>>,
  setTeams: Dispatch<SetStateAction<TeamRead[] | undefined>>,
  setDeployments: Dispatch<SetStateAction<DeploymentRead[] | undefined>>,
  setVms: Dispatch<SetStateAction<VmRead[] | undefined>>,
  setGpuLeases: Dispatch<SetStateAction<GpuLeaseRead[] | undefined>>,
  setGpuGroups: Dispatch<SetStateAction<GpuGroupRead[] | undefined>>,
  setJobs: Dispatch<SetStateAction<JobRead[] | undefined>>
) {
  if (!(initialized && keycloak.authenticated && keycloak.token)) return;

  const startTimer = Date.now();
  const promises = [
    async () => {
      try {
        const response = await getAllUsers(keycloak.token!);
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
        const response = await listVMs(keycloak.token!, true);
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
        const response = await getDeployments(keycloak.token!, true);
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
        const response = await listGpuLeases(keycloak.token!, undefined, true);
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
        const response = await listGpuGroups(keycloak.token!, undefined);
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
        const response = await getTeams(keycloak.token!, true);
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
        const response = await getJobs(
          keycloak.token!,
          undefined,
          undefined,
          true
        );
        setJobs(response);
      } catch (error: any) {
        errorHandler(error).forEach((e) =>
          enqueueSnackbar(t("error-could-not-fetch-jobs") + ": " + e, {
            variant: "error",
          })
        );
      }
    },
  ];

  await Promise.all(promises.map((p) => p()));

  // end timer and set last refresh, show in ms
  setLastRefresh(new Date().getTime());
  setLastRefreshRtt(Date.now() - startTimer);
}
