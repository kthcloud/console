// hooks
import { useState, createContext, useEffect } from "react";
import useInterval from "src/hooks/useInterval";
import { useSnackbar } from "notistack";
import { useKeycloak } from "@react-keycloak/web";

// api
import { getJob } from "src/api/deploy/jobs";
import { getVM, getVMs } from "src/api/deploy/vms";
import { getDeployment, getDeployments } from "src/api/deploy/deployments";
import { errorHandler } from "src/utils/errorHandler";
import { getUser } from "src/api/deploy/users";
import { getZones } from "src/api/deploy/zones";

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

  const [impersonatingDeployment, setImpersonatingDeployment] = useState(null);
  const [impersonatingVm, setImpersonatingVm] = useState(null);
  const [rows, setRows] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [initialLoad, setInitialLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const refreshJob = async (jobId) => {
    if (!(initialized && keycloak.authenticated)) return;

    try {
      const response = await getJob(jobId, keycloak.token);

      if (response.status === "finished") {
        navigator.vibrate?.(30);
        setTimeout(() => {
          setJobs((jobs) => jobs.filter((job) => job.jobId !== jobId));
        }, 5000);
      }

      if (response.status === "terminated") {
        navigator.vibrate?.(30);
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
  };

  const mergeLists = (resources) => {
    let array = [];

    resources.forEach((resource) => {
      if (resource) {
        array = array.concat(resource);
      }
    });

    setRows(array);

    setUserRows(array.filter((row) => row.ownerId === user.id));
  };

  const loadUser = async () => {
    if (!(initialized && keycloak.authenticated)) return;
    const user = await getUser(keycloak.subject, keycloak.token);
    setUser(user);
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
    user && user?.role?.permissions?.includes("chooseZone") && loadZones();
    // eslint-disable-next-line
  }, [user]);

  useInterval(() => {
    loadUser();
  }, 5000);

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
        user,
        setUser,
        zones,
        setZones,
        queueJob,
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
