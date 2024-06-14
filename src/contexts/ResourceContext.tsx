// hooks
import React, { useState, createContext, useEffect } from "react";
import useInterval from "../hooks/useInterval";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";

// api
import { getJob } from "../api/deploy/jobs";
import { getDeployment, getDeployments } from "../api/deploy/deployments";
import { errorHandler } from "../utils/errorHandler";
import { getUser } from "../api/deploy/users";
import { getZones } from "../api/deploy/zones";
import { getNotifications } from "../api/deploy/notifications";
import { getTeams } from "../api/deploy/teams";
import { getVMById, listVMs } from "../api/deploy/vms";

import {
  NotificationRead,
  ResourceMigrationRead,
  TeamRead as Team,
  ZoneRead as Zone,
} from "@kthcloud/go-deploy-types/types/v2/body/index";
import { Job, Resource, User, Uuid } from "../types";
import {
  GpuGroupRead,
  GpuLeaseRead,
} from "@kthcloud/go-deploy-types/types/v2/body";
import { listGpuGroups } from "../api/deploy/gpuGroups";
import { listGpuLeases } from "../api/deploy/gpuLeases";
import { listMigrations } from "../api/deploy/resourceMigrations";

type ResourceContextType = {
  rows: Resource[];
  setRows: (rows: Resource[]) => void;
  userRows: Resource[];
  setUserRows: (rows: Resource[]) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  nextLoad: number;
  connectionError: boolean;
  user: User | null;
  setUser: (user: User) => void;
  notifications: NotificationRead[];
  setNotifications: (notifications: NotificationRead[]) => void;
  unread: number;
  setUnread: (unread: number) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  zones: Zone[];
  setZones: (zones: Zone[]) => void;
  gpuGroups: GpuGroupRead[];
  setGpuGroups: (gpuGroups: GpuGroupRead[]) => void;
  gpuLeases: GpuLeaseRead[];
  setGpuLeases: (gpuLeases: GpuLeaseRead[]) => void;
  resourceMigrations: ResourceMigrationRead[];
  setResourceMigrations: (resourceMigrations: ResourceMigrationRead[]) => void;
  queueJob: (job: Job) => void;
  beginFastLoad: () => void;
  initialLoad: boolean;
  setInitialLoad: (initialLoad: boolean) => void;
  impersonatingDeployment: Uuid | null;
  setImpersonatingDeployment: (deployment: Uuid) => void;
  impersonatingVm: Uuid | null;
  setImpersonatingVm: (vm: Uuid) => void;
};

const initialState: ResourceContextType = {
  rows: new Array<Resource>(),
  setRows: () => {},
  userRows: new Array<Resource>(),
  setUserRows: () => {},
  jobs: new Array<Job>(),
  setJobs: () => {},
  nextLoad: 0,
  connectionError: false,
  user: null,
  setUser: () => {},
  notifications: new Array<NotificationRead>(),
  setNotifications: () => {},
  unread: 0,
  setUnread: () => {},
  teams: new Array<Team>(),
  setTeams: () => {},
  zones: new Array<Zone>(),
  setZones: () => {},
  gpuGroups: new Array<GpuGroupRead>(),
  setGpuGroups: () => {},
  gpuLeases: new Array<GpuLeaseRead>(),
  setGpuLeases: () => {},
  resourceMigrations: new Array<ResourceMigrationRead>(),
  setResourceMigrations: () => {},
  queueJob: () => {},
  initialLoad: false,
  setInitialLoad: () => {},
  beginFastLoad: () => {},
  impersonatingDeployment: null,
  setImpersonatingDeployment: () => {},
  impersonatingVm: null,
  setImpersonatingVm: () => {},
};

export const ResourceContext = createContext(initialState);

export const ResourceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { initialized, keycloak } = useKeycloak();

  // Admin impersonation
  const [impersonatingDeployment, setImpersonatingDeployment] =
    useState<Uuid | null>(null);
  const [impersonatingVm, setImpersonatingVm] = useState<Uuid | null>(null);

  // Resources
  const [rows, setRows] = useState<Resource[]>([]);
  const [userRows, setUserRows] = useState<Resource[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [gpuGroups, setGpuGroups] = useState<GpuGroupRead[]>([]);
  const [gpuLeases, setGpuLeases] = useState<GpuLeaseRead[]>([]);
  const [resourceMigrations, setResourceMigrations] = useState<
    ResourceMigrationRead[]
  >([]);

  // Loading and connection error handler
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const [nextLoad, setNextLoad] = useState<number>(0);
  const [loadInterval, setLoadInterval] = useState<number>(5000);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [fastLoading, setFastLoading] = useState<boolean>(false);

  // Dynamic reload interval
  const [rtt, setRtt] = useState<number>(0);
  const [loadStart, setLoadStart] = useState<number | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const refreshJob = async (jobId: Uuid) => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;

    try {
      const response = await getJob(jobId, keycloak.token);

      if (response.status === "finished") {
        navigator?.vibrate([0.1, 5, 0.1]);
        setTimeout(() => {
          setJobs((jobs) => jobs.filter((job) => job.jobId !== jobId));
        }, 5000);
      }

      if (response.status === "terminated") {
        navigator?.vibrate([0.1, 5, 0.1]);
        setTimeout(() => {
          setJobs((jobs) => jobs.filter((job) => job.jobId !== jobId));
        }, 5000);
      }

      // set type and status
      setJobs((jobs) =>
        jobs.map((job) => {
          if (job.jobId === jobId) {
            job.type = response.type;
            job.status = response.status;
            job.lastError = response.lastError;
            try {
              job.name = rows.filter((row) => row.id === job.id)[0].name;
            } catch (e) {
              console.log("Error getting name for job", job);
            }
          }
          return job;
        })
      );
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error refreshing job: " + e, {
          variant: "error",
        })
      );
    }
  };

  const queueJob = (job: Job) => {
    console.log("Queuing job", JSON.stringify(job));
    if (!job) return;
    setJobs((jobs) => [...jobs, job]);
    setLoadInterval(rtt + 100);
  };

  const beginFastLoad = () => {
    setFastLoading(true);
    setLoadInterval(rtt + 100);
  };

  const mergeLists = (resources: Resource[][]) => {
    let array: Resource[] = [];

    resources.forEach((resource) => {
      if (resource) {
        array = array.concat(resource);
      }
    });

    setRows(array);
    setUserRows(array);
  };

  const loadZones = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const zones = await getZones(keycloak.token);
      setZones(zones);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching zones: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadGpuGroups = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const gpuGroups = await listGpuGroups(keycloak.token);
      setGpuGroups(gpuGroups);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching GPU groups: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadGpuLeases = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const gpuLeases = await listGpuLeases(keycloak.token);
      setGpuLeases(gpuLeases);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching GPU leases: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadResourceMigrations = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const migrations = await listMigrations(keycloak.token);
      setResourceMigrations(migrations);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching migrations: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadNotifications = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const notifications = await getNotifications(keycloak.token);
      setNotifications(notifications);

      let u = 0;
      notifications.forEach((n) => {
        if (!n.readAt) {
          u++;
        }
      });

      setUnread(u);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching notifications: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadTeams = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;
    try {
      const teams = await getTeams(keycloak.token, false);
      setTeams(teams);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching teams: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadUser = async () => {
    try {
      if (
        !(
          initialized &&
          keycloak.authenticated &&
          keycloak.token &&
          keycloak.subject
        )
      )
        return;
      const user = await getUser(keycloak.subject, keycloak.token);
      setUser(user);
      setConnectionError(false);
      loadNotifications();
      loadTeams();

      if (loadInterval < 5000) {
        let newInterval = loadInterval + 100;
        if (newInterval > 5000) {
          newInterval = 5000;
        }
        setFastLoading(true);
        setLoadInterval(newInterval);
      }
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching user: " + e, {
          variant: "error",
        })
      );

      setConnectionError(true);
      if (new Date().getTime() > nextLoad)
        setLoadInterval(Math.min(loadInterval * 2, 60000));
    }
  };

  const loadResources = async () => {
    if (!(initialized && keycloak.authenticated && keycloak.token)) return;

    try {
      const promises = [
        getDeployments(keycloak.token),
        listVMs(keycloak.token),
      ];

      if (user && user.admin) {
        if (impersonatingVm) {
          console.log("Getting impersonation vm");
          promises.push(getVMById(keycloak.token, impersonatingVm));
        }

        if (impersonatingDeployment) {
          console.log("Getting impersonation deployment");
          promises.push(getDeployment(keycloak.token, impersonatingDeployment));
        }
      }

      mergeLists(await Promise.all(promises));

      setInitialLoad(true);
      if (loadStart) setRtt(Date.now() - loadStart);
    } catch (error: any) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching resources: " + e, {
          variant: "error",
        })
      );
    }
  };

  const sendJwtToServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: "JWT",
          jwt: keycloak.token,
        });
      }
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [initialized]);

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadZones();
    loadGpuGroups();
    loadGpuLeases();
    loadResourceMigrations();

    // eslint-disable-next-line
  }, [user]);

  useInterval(() => {
    if (fastLoading) {
      setFastLoading(false);
      return;
    }
    setLoadStart(Date.now());
    loadUser();
    sendJwtToServiceWorker();

    setNextLoad(Date.now() + loadInterval);
  }, loadInterval);

  useInterval(async () => {
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status !== "finished" && jobs[i].status !== "terminated") {
        await refreshJob(jobs[i].jobId);
      }
    }
  }, 500);

  return (
    <ResourceContext.Provider
      value={{
        rows,
        setRows,
        userRows,
        setUserRows,
        jobs,
        setJobs,
        nextLoad,
        connectionError,
        user,
        setUser,
        notifications,
        setNotifications,
        unread,
        setUnread,
        teams,
        setTeams,
        zones,
        setZones,
        gpuGroups,
        setGpuGroups,
        gpuLeases,
        setGpuLeases,
        resourceMigrations,
        setResourceMigrations,
        queueJob,
        beginFastLoad,
        initialLoad,
        setInitialLoad,
        impersonatingDeployment,
        setImpersonatingDeployment,
        impersonatingVm,
        setImpersonatingVm,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export default ResourceContext;
