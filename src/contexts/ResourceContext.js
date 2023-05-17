// hooks
import { useState, createContext, useEffect } from "react";
import useInterval from "src/hooks/useInterval";
import useAlert from "src/hooks/useAlert";
import { useKeycloak } from "@react-keycloak/web";

// api
import { getJob } from "src/api/deploy/jobs";
import { getVMs } from "src/api/deploy/vms";
import { getDeployments } from "src/api/deploy/deployments";

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

  const [rows, setRows] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [initialLoad, setInitialLoad] = useState(false);
  const { setAlert } = useAlert();


  const refreshJob = async (jobId) => {
    if (!initialized) return;

    try {
      const response = await getJob(jobId, keycloak.token);

      // set type and status
      setJobs((jobs) =>
        jobs.map((job) => {
          if (job.jobId === jobId) {
            job.type = response.type;
            job.status = response.status;
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
      setAlert(
        "Error refreshing job " + jobId + ": " + JSON.stringify(error),
        "error"
      );
    }
  };

  const queueJob = (job) => {
    console.log("Queuing job", JSON.stringify(job))
    if (!job) return;
    setJobs((jobs) => [...jobs, job]);
  };

  const mergeLists = (resources) => {
    let array = resources[0].concat(resources[1]);
    setRows(array);
  };

  const loadResources = async () => {
    if (!initialized) return;

    try {
      const promises = [getVMs(keycloak.token), getDeployments(keycloak.token)];
      mergeLists(await Promise.all(promises));
      setInitialLoad(true);
    } catch (error) {
      setAlert("Error fetching resources: " + JSON.stringify(error), "error");
    }
  };

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line
  }, [initialized]);

  useInterval(() => {
    loadResources();
  }, 5000);

  useInterval(async () => {
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status !== "jobFinished") {
        await refreshJob(jobs[i].jobId);
      }
    }
  }, 500);

  return (
    <ResourceContext.Provider
      value={{
        rows,
        setRows,
        jobs,
        setJobs,
        queueJob,
        initialLoad,
        setInitialLoad,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export default ResourceContext;
