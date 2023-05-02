import { Chip, CircularProgress, Stack } from "@mui/material";
import { sentenceCase } from "change-case";
import Iconify from "../../components/Iconify";

export default function JobList({ jobs, rows, setJobs }) {
  
    const handleDelete = (job) => {
    setJobs(jobs.filter((j) => !(j.id === job.id && j.status === job.status && j.type === job.type )));
  };

  return (
    <Stack direction={"row"} flexWrap={"wrap"} mb={2}>
      {jobs.map(
        (job) =>
          Object.hasOwn(job, "type") &&
          Object.hasOwn(job, "status") &&
          Object.hasOwn(job, "name") && (
            <Chip
              key={job.jobId}
              icon={
                job.status === "jobFinished" ? (
                  <Iconify
                    icon="carbon:checkmark-filled"
                    width={20}
                    height={20}
                    mx={1}
                  />
                ) : (
                  <CircularProgress size={20} mx={1} />
                )
              }
              label={
                <>
                  <span>{sentenceCase(job.type) + " " + job.name}</span>
                </>
              }
              sx={{
                mb: 2,
                mr: 2,
              }}
              color={job.status === "jobFinished" ? "primary" : "default"}
              onDelete={() => handleDelete(job)}
            />
          )
      )}
    </Stack>
  );
}
