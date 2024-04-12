import {
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Toolbar,
} from "@mui/material";
import { sentenceCase } from "change-case";
import Iconify from "./Iconify";
import useResource from "../hooks/useResource";
import { Job } from "../types";

export default function JobList() {
  const { jobs, setJobs } = useResource();

  const handleDelete = (job: Job) => {
    setJobs(
      jobs.filter(
        (j) =>
          !(j.id === job.id && j.status === job.status && j.type === job.type)
      )
    );
  };

  const resolveColor = (status: string) => {
    switch (status) {
      case "finished":
        return "primary";
      case "terminated":
        return "error";
      default:
        return "default";
    }
  };

  const fixAbbr = (jobType: string) => {
    return jobType
      .replace("vm", "VM")
      .replace("gpu", "GPU")
      .replace("Vm", "VM");
  };

  const renderText = (job: Job) => {
    if (job.status !== "running" && job.status !== "finished") {
      return (
        <>
          <span>
            {fixAbbr(sentenceCase(job.type)) + " " + job.name + "  "}
            <b>{" " + fixAbbr(sentenceCase(job.status.replace("job", "")))}</b>
          </span>
        </>
      );
    }

    return (
      <>
        <span>{fixAbbr(sentenceCase(job.type)) + " " + job.name}</span>
      </>
    );
  };

  if (jobs.length === 0) {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{
        top: "auto",
        bottom: 0,
        padding: 2,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} component="div" />
        <Stack direction={"row"} flexWrap={"wrap"}>
          {jobs.map(
            (job) =>
              Object.hasOwn(job, "type") &&
              Object.hasOwn(job, "status") &&
              Object.hasOwn(job, "name") && (
                <Chip
                  key={job.jobId}
                  icon={
                    job.status === "finished" ? (
                      <Iconify
                        icon="carbon:checkmark-filled"
                        width={20}
                        height={20}
                        mx={1}
                      />
                    ) : (
                      <CircularProgress size={20} sx={{ mx: 1 }} />
                    )
                  }
                  label={renderText(job)}
                  sx={{
                    mb: 2,
                    mr: 2,
                  }}
                  color={resolveColor(job.status)}
                  onDelete={() => handleDelete(job)}
                />
              )
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
