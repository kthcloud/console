// hooks
import { useState, createContext, useEffect } from "react";
import useInterval from "/src/hooks/useInterval";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";

// api
import { getJob } from "/src/api/deploy/jobs";
import { getVM, getVMs } from "/src/api/deploy/vms";
import { getDeployment, getDeployments } from "/src/api/deploy/deployments";
import { errorHandler } from "/src/utils/errorHandler";
import { getUser } from "/src/api/deploy/users";
import { getZones } from "/src/api/deploy/zones";
import { getNotifications } from "/src/api/deploy/notifications";
import { getTeams } from "/src/api/deploy/teams";
import { getUserData } from "/src/api/deploy/userData";

const initialState = {
  rows: [],
  jobs: [],
  initialLoad: false,
};

export const ResourceContext = createContext({
  ...initialState,
  queueJob: () => {},
});

export const ResourceContextProvider = ({ children }) => {
  const { initialized, keycloak } = useKeycloak();

  // Admin impersonation
  const [impersonatingDeployment, setImpersonatingDeployment] = useState(null);
  const [impersonatingVm, setImpersonatingVm] = useState(null);

  // Resources
  const [rows, setRows] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [teams, setTeams] = useState([]);
  const [zones, setZones] = useState([]);

  // Loading and connection error handler
  const [initialLoad, setInitialLoad] = useState(false);
  const [nextLoad, setNextLoad] = useState(0);
  const [loadInterval, setLoadInterval] = useState(5000);
  const [connectionError, setConnectionError] = useState(false);

  // Dynamic reload interval
  const [rtt, setRtt] = useState(0);
  const [loadStart, setLoadStart] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const refreshJob = async (jobId) => {
    if (!(initialized && keycloak.authenticated)) return;

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
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error refreshing job: " + e, {
          variant: "error",
        })
      );
    }
  };

  const queueJob = (job) => {
    console.log("Queuing job", JSON.stringify(job));
    if (!job) return;
    setJobs((jobs) => [...jobs, job]);
    setLoadInterval(rtt + 100);
  };

  const beginFastLoad = () => {
    setLoadInterval(rtt + 100);
  };

  const mergeLists = (resources) => {
    let array = [];

    resources.forEach((resource) => {
      if (resource) {
        array = array.concat(resource);
      }
    });

    setRows(array);
    setUserRows(array);
  };

  const loadZones = async () => {
    if (!(initialized && keycloak.authenticated)) return;
    try {
      const zones = await getZones(keycloak.token);
      setZones(zones);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching zones: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadNotifications = async () => {
    if (!(initialized && keycloak.authenticated)) return;
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
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching notifications: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadTeams = async () => {
    if (!(initialized && keycloak.authenticated)) return;
    try {
      const teams = await getTeams(keycloak.token, false);
      setTeams(teams);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching teams: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadUser = async () => {
    try {
      if (!(initialized && keycloak.authenticated)) return;
      const user = await getUser(keycloak.subject, keycloak.token);
      setUser(user);
      setConnectionError(false);

      loadNotifications();
      loadTeams();
      loadUserData();

      if (loadInterval < 5000) {
        let newInterval = loadInterval + 100;
        if (newInterval > 5000) {
          newInterval = 5000;
        }
        setLoadInterval(newInterval);
      }
    } catch (error) {
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

  const loadUserData = async () => {
    try {
      const userData = await getUserData(keycloak.token);
      setUser((user) => ({ ...user, userData }));
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching user data: " + e, {
          variant: "error",
        })
      );
    }
  };

  const loadResources = async () => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      const promises = [getVMs(keycloak.token), getDeployments(keycloak.token)];

      if (user.admin && impersonatingVm) {
        console.log("Getting impersonation vm");
        promises.push(getVM(keycloak.token, impersonatingVm));
      }

      if (user.admin && impersonatingDeployment) {
        console.log("Getting impersonation deployment");
        promises.push(getDeployment(keycloak.token, impersonatingDeployment));
      }

      mergeLists(await Promise.all(promises));

      setInitialLoad(true);
      if (loadStart) setRtt(Date.now() - loadStart);
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar("Error fetching resources: " + e, {
          variant: "error",
        })
      );
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
    user && loadZones();
    // eslint-disable-next-line
  }, [user]);

  useInterval(() => {
    setLoadStart(Date.now());
    loadUser();

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
